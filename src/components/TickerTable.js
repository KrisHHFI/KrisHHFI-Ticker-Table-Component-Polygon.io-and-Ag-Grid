import React, { useState, useEffect, useRef } from 'react';
// AgGrid imports
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css';
// Created by Kristopher Pepper in 2023
// Polygon.io API in use. User must use their own Polygon API key as the "apiKey" variable. Polygon.io allows 5 GET's per/min.
// Component Called via <TickerTable /> 
// Dependencies in use- ag-grid-community@28.2.1 ag-grid-react@28.2.1
export default function TickerTable(props) {
    const apiKey = ''; // Insert your personal api code
    let tickerInput = ''; // Ticker input string
    const [tickers, setTickers] = useState([]); // The ticker array
    const gridRef = useRef(); // Grid ref required by AgGrid
    // AdGrid columns
    const columns = [
        { field: "ticker", sortable: true, filter: true, floatingFilter: true },
        { field: "name", sortable: true, filter: true, floatingFilter: true },
        { field: "locale", sortable: true, filter: true, floatingFilter: true },
        { field: "currency_name", headerName: 'Currency', sortable: true, filter: true, floatingFilter: true },
        { field: "market_cap", headerName: 'Market Cap (MM)', sortable: true, filter: true, floatingFilter: true },
        { field: "total_employees", headerName: 'Total Employees', sortable: true, filter: true, floatingFilter: true },
        { field: "weighted_shares_outstanding", headerName: 'Shares Outstanding', sortable: true, filter: true, floatingFilter: true }
    ]
    // Fetches ticker from API
    const addTicker = (event) => {
        tickerInput = document.getElementById("tickerInputBox").value;
        let url = 'https://api.polygon.io/v3/reference/tickers/' + tickerInput + '?apiKey=' + apiKey;
        // The API fetch and return
        async function getRetrievedData() {
            const response = await fetch(url);
            var data = await response.json(); // Data saved array (waits for fetch)
            data = data.results;
            return data;
        }
        // Adds ticker to ticker list. (Gets data and processes)
        async function addToList() {
            let data = await getRetrievedData();
            data.locale = data.locale.toUpperCase();
            data.currency_name = data.currency_name.toUpperCase();
            data.market_cap = Math.trunc(data.market_cap / 1000000);
            // Replaces the current state to a new one
            setTickers([...tickers, {
                ticker: data.ticker, name: data.name, locale: data.locale, currency_name: data.currency_name,
                market_cap: data.market_cap, total_employees: data.total_employees, weighted_shares_outstanding: data.weighted_shares_outstanding
            }]);
            document.getElementById("tickerInputBox").value = "";
        }
        addToList(); // addToList called, which calls getRetrievedData.
    }
    // Delete Customer 
    const deleteTicker = (rowData) => {
        // Identified the selected row, by grid ref number
        if (gridRef.current.getSelectedNodes().length > 0) {
            let text = 'Delete ticker?';
            // User must click ok to proceed
            if (window.confirm(text) == false) {
                return;
            }
            let selectedRow = gridRef.current.getSelectedRows(); // Gets the ticker data from the selected row
            tickerInput = selectedRow[0].ticker; // Gets the unique ticker symbol
            // Filters out the chosen row, according to the symbol
            setTickers((current) =>
                current.filter((item) => item.ticker !== tickerInput)
            );
            // If a row isn't selected then show alert message
        } else {
            alert('Select row first');
        }
    }
    // Page output
    return (
        <div>
            <h2>US Stock Ticker Search</h2>
            {/* Add ticker input */}
            <fieldset>
                <legend>Add/Ticker</legend>
                <input type="text" id="tickerInputBox" placeholder="Ticker" name="ticker" value={tickerInput.tickerInput} />
                <button onClick={addTicker}>Add</button>
                <button onClick={deleteTicker}>Delete</button>
            </fieldset>
            {/* The Aggrid table is returned to screen */}
            <div className="ag-theme-material"
                style={{ height: '700px', width: '70%', margin: 'auto' }} >
                <AgGridReact
                    ref={gridRef}
                    onGridReady={params => gridRef.current = params.api}
                    rowSelection="single"
                    columnDefs={columns}
                    animateRows={true}
                    rowData={tickers}>
                </AgGridReact>
            </div>
        </div>
    );
}