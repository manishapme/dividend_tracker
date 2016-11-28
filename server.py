import os
from flask import Flask, render_template, request, jsonify, session
from yahoo_finance import Share
import pyrebase
from urllib.error import HTTPError

config = {
    "apiKey": os.environ["FIREBASE_API_KEY"],
    "authDomain": "dividend-tracker-5586d.firebaseapp.com",
    "databaseURL": "https://dividend-tracker-5586d.firebaseio.com",
    "storageBucket": "dividend-tracker-5586d.appspot.com",
    "serviceAccount": "secrets/firebase_key.json"
}

app = Flask(__name__)
app.secret_key = os.environ['FLASK_SECRET_KEY']
firebase = pyrebase.initialize_app(config)


@app.route('/')
def show_landing():
    return render_template('index.html')


@app.route('/login', methods=['POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')

    if email and password:
        # Get a reference to the auth service
        auth = firebase.auth()
        
        try:
            # Log the user in
            user = auth.sign_in_with_email_and_password(email, password)
        
            if user['registered']:
                session['current_user'] = user
                return jsonify({'result': 'Login successful.'})

        except:
            return jsonify({'result': 'Unable to login'})


@app.route('/logout', methods=['GET'])
def logout():       
        if session['current_user']:
            del session['current_user']
        return jsonify({'result': 'User logged out.'})


@app.route('/quote/<ticker>/<shares>')
def get_quote(ticker, shares):
    refresh_token()

    ticker = ticker.upper()
    shares = int(shares)
    yahoo = Share(ticker)
    d = dict()

    if yahoo.get_price() and float(shares)>=1:
        d['ticker'] = ticker
        d['stock_name'] = yahoo.get_name()
        d['price'] = float(yahoo.get_price())
        d['shares'] = int(shares)
        d['stock_value'] = float(yahoo.get_price()) * shares
        d['trade_datetime'] = yahoo.get_trade_datetime()

        if not yahoo.get_dividend_yield():
            d['div_yield'] = 0
            d['div_share'] = 0        
            d['div_income'] = 0
        else:
            d['div_yield'] = float(yahoo.get_dividend_yield())
            d['div_share'] = float(yahoo.get_dividend_share())      
            d['div_income'] = float(shares) * float(yahoo.get_dividend_share())
    else:
        d[ticker] = 'No result'
    return jsonify(d)


@app.route('/add_position', methods=['POST'])
def add_position():
    if not session.get('current_user'):
        return jsonify({'result': 'Must be logged in to use this feature.'})

    refresh_token()
    db = firebase.database()
    
    # ADD POSITION
    d = dict()
    d['ticker'] = request.form.get('ticker').upper()
    d['stock_name'] = request.form.get('stock_name')
    d['price'] = request.form.get('price')
    d['div_yield'] = request.form.get('div_yield')
    d['div_share'] = request.form.get('div_share')
    d['shares'] = request.form.get('shares')
    d['div_income'] = request.form.get('div_income')
    d['stock_value'] = request.form.get('stock_value')
    d['trade_datetime'] = request.form.get('trade_datetime')
    results = db.child('positions/' + session['current_user']['localId']).child(request.form.get('ticker').upper()).set(d, session['current_user']['idToken'])  

    positions = db.child('positions/' + session['current_user']['localId']).order_by_key().get()
    portfolio = list()
    portfolio_value = 0
    portfolio_income = 0

    for i in positions.each():
        data = i.val()
        portfolio_income += float(data['div_income'])
        portfolio_value += float(data['stock_value'])
        portfolio.append(data)

    return jsonify(result=portfolio, p_income=portfolio_income, p_value=portfolio_value)


def refresh_token():
    if session.get('current_user', None):
        auth = firebase.auth()
        user = auth.refresh(session['current_user']['refreshToken'])
        # session['current_user'] = user

# TODO LIST
# add welcome message to signed in user. session['current_user']['email']
# ensure you can't create duplicate positions


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
