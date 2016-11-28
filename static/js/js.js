(function() {
  'use strict';

    // TODO add startup code here


    // EVENT LISTENERS
    document.getElementById("btn_quote").addEventListener("click", getQuote);
    document.getElementById("btn_addPosition").addEventListener("click", addPosition);
    document.getElementById("btn_login").addEventListener("click", login);
    document.getElementById("btn_logout").addEventListener("click", logout);


    // LOGIN
    function login(e){
        e.preventDefault();
        var fd = new FormData(document.getElementById("formLogin"));
        var url = "/login";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    showMessage( response.result );
                } else {
                    var response = JSON.parse(request.response);
                    console.log(response);
                    ajaxError(request.status);
                }
            }
        };
        request.open('POST', url);
        request.send(fd);
    } 


    function logout(e){
        e.preventDefault();
        var url = "/logout";

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    showMessage( response.result );
                } else {
                    var response = JSON.parse(request.response);
                    console.log(response);
                    ajaxError(request.status);
                }
            }
        };
        request.open('GET', url);
        request.send();
    } 


    // GET QUOTE
    function getQuote(e){
        e.preventDefault();
        var ticker = document.getElementById("ticker").value;
        var shares = document.getElementById("shares").value;
        var url = "/quote/"+ticker+"/"+shares;
        // var fd = new FormData(document.querySelector('#formQuote'))

        // TODO add cache logic here

        // Fetch the latest data.
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    drawResult(response);
                } else {
                // TODO, handle error when no data is available.
                    ajaxError(request.status);
                }
            }
        };
        request.open('GET', url);
        request.send();
    } 

    // DRAW RESULTS
    function drawResult(response){
        document.getElementById('qrStock').value = response.stock_name;
        document.getElementById('qrPrice').value = response.price;
        document.getElementById('qrYield').value = response.div_yield;
        document.getElementById('qrDivPerShare').value = response.div_share;
        document.getElementById('qrEstAnnualIncome').value = response.div_income;
        document.getElementById('qrStockValue').value = response.stock_value;
        document.getElementById('qrLastUpdated').value = response.trade_datetime;
    }

    function drawPositionTable(response){
        var t = document.getElementById('positions');
        var p_income = response.p_income;
        var p_value = response.p_value;
        var result = response.result;
        var rowLen = t.getElementsByTagName('tr').length;

        // CLEAR OUT PREVIOUS RESULTS
        for (var i=0; i < rowLen-1; i++){
            t.deleteRow(-1);
        }

        // DRAW NEW RESULTS
        for (var i=0; i < result.length; i++){
            var r = t.insertRow(-1);

            var cell1 = r.insertCell(0);
            cell1.innerHTML = result[i].ticker;
            console.log('ticker'+ result[i].ticker);
            cell1 = r.insertCell(1);
            cell1.innerHTML = result[i].stock_name;
            cell1 = r.insertCell(2);
            cell1.innerHTML = result[i].price;
            cell1 = r.insertCell(3);
            cell1.innerHTML = result[i].shares;
            cell1 = r.insertCell(4);
            cell1.innerHTML = result[i].div_yield;
            cell1 = r.insertCell(5);
            cell1.innerHTML = result[i].div_share;
            cell1 = r.insertCell(6);
            cell1.innerHTML = result[i].div_income;
            cell1 = r.insertCell(7);
            cell1.innerHTML = result[i].stock_value;
            cell1 = r.insertCell(8);
            cell1.innerHTML = result[i].trade_datetime;
        }

        // ADD TOTALS
        r = t.insertRow(-1);
        cell1 = r.insertCell(0);
        cell1 = r.insertCell(1);
        cell1.innerHTML = 'TOTALS';
        cell1 = r.insertCell(2);
        cell1 = r.insertCell(3);
        cell1 = r.insertCell(4);
        cell1 = r.insertCell(5);
        cell1 = r.insertCell(6);
        cell1.innerHTML = p_income;
        cell1 = r.insertCell(7);
        cell1.innerHTML = p_value;
        cell1 = r.insertCell(8);

        clearQuoteForm();

    }

    function clearQuoteForm(){
        document.getElementById('shares').value = '';
        document.getElementById('ticker').value = '';
        document.getElementById('qrStock').value = '';
        document.getElementById('qrPrice').value = '';
        document.getElementById('qrStock').value = '';
        document.getElementById('qrPrice').value = '';
        document.getElementById('qrYield').value = '';
        document.getElementById('qrDivPerShare').value = '';
        document.getElementById('qrEstAnnualIncome').value = '';
        document.getElementById('qrStockValue').value = '';
        document.getElementById('qrLastUpdated').value = '';
    }

    // GET ADD POSITION
    function addPosition(e){
        e.preventDefault();
        var url = "/add_position";
        var fd = new FormData(document.getElementById("formQuote"));

        // TODO add cache logic here

        // Fetch the latest data.
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    // showMessage( response.result );
                    console.log( response );
                    drawPositionTable(response);
                } else {
                // TODO, handle error when no data is available.
                    console.log(response);
                    ajaxError(request.status);
                }
            }
        };
        request.open('POST', url);
        request.send(fd);
    } 


    // HANDLE AJAX ERROR
    function ajaxError(errorCode){
        alert('Could not complete request. Request status: '+ errorCode);
    }

    // FLASH MESSAGE
    function showMessage(msg){
        alert(msg);
    }
  // TODO add service worker code here
})();