import React, { Component } from 'react';
import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle
} from 'reactstrap';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            restaurants: [],
            inputValue: ' ',
            searchValid: false,
            dropdownOpenXAxis: false,
            dropdownOpenYAxis: false,
            XValue: 'X Axis',
            YValue: 'Y Axis'
        };
    }

    toggleXAxis() {
        this.setState({
            dropdownOpenXAxis: !this.state.dropdownOpenXAxis
        });
    }

    toggleYAxis() {
        this.setState({
            dropdownOpenYAxis: !this.state.dropdownOpenYAxis
        });
    }

    XAxisOnClick(e) {
        this.setState({
            XValue: e.target.innerText
        })
    }

    YAxisOnClick(e) {
        this.setState({
            YValue: e.target.innerText
        })
    }

    handleChange(e) {
        this.setState({
            inputValue: e.target.value
        })
    }

    handleClick() {
        let myheaders = {
            Authorization: "Bearer Q6gl3hCqqMV9E6N7rimjj98XiBDKkzfXXJYIWYPN3_eXlTExvt0mV5ghoW9fxn2suyLGz1P3xvPtnzSZKEs95UG9JVkrtL1Z2aJ7WnGYX-eksP79-2JtYAkKsn-PWnYx"
        }
        // check if this works in production?
        let corsProxy = "https://cors-anywhere.herokuapp.com/";
        let yelpRequest = "https://api.yelp.com/v3/businesses/search?term=food&location=" + this.state.inputValue + "&sort_by=rating&limit=50";
        let request = corsProxy + yelpRequest;
        fetch(request, {
            method: "GET",
            headers: myheaders
        })
            .then((response) => {
                if (response.ok) {
                    return response.json()
                } else {
                    this.setState({
                        restaurants: [],
                        searchValid: false
                    })
                    throw new Error("Something Went Wrong! Try Again?");
                }
            })
            .then((data) => {
                let rests$ = data['businesses'].filter(function (r) {
                    if (r.price === '$') {
                        return r;
                    }
                })
                let rests$$ = data['businesses'].filter(function (r) {
                    if (r.price === '$$') {
                        return r;
                    }
                })
                let rests$$$ = data['businesses'].filter(function (r) {
                    if (r.price === '$$$') {
                        return r;
                    }
                })
                let rests$$$$ = data['businesses'].filter(function (r) {
                    if (r.price === '$$$$') {
                        return r;
                    }
                })
                let x = rests$.concat(rests$$);
                let y = rests$$$.concat(rests$$$$);
                let z = x.concat(y);
                this.setState({
                    restaurants: z,
                    searchValid: true
                })
            })
            .catch((err) => {
                alert(err);
            })
    }

    render() {
        return (
            <div>
                <Header />
                <div className="container">
                    <ZipCodeBox handleChangeCb={(e) => this.handleChange(e)} handleClickCb={() => this.handleClick()} />
                    {this.state.searchValid && (
                        <div>
                            <h3>Top 50 Restaurants</h3>
                            <YelpTable rests={this.state.restaurants} />
                            <div>
                                <h3>Analyzing Top 50 Restaurants</h3>
                                <p className="lead">Create a Graph to analyze data</p>
                                <span className="mr-3">
                                    <AnalyzeDataStats axis={'X Axis'} isOpen={this.state.dropdownOpenXAxis} toggle={() => this.toggleXAxis()} onClick={(e) => this.XAxisOnClick(e)} value={this.state.XValue} showPrice={true} />
                                </span>
                                <AnalyzeDataStats axis={'Y Axis'} isOpen={this.state.dropdownOpenYAxis} toggle={() => this.toggleYAxis()} onClick={(e) => this.YAxisOnClick(e)} value={this.state.YValue} showPrice={false} />

                                <RequestedChart rests={this.state.restaurants} XValue={this.state.XValue} YValue={this.state.YValue} />
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }
}

class Header extends Component {
    render() {
        return (
            <div className="jumbotron">
                <div className="container-fluid">
                    <h1 className="display-4">Analyze Popular Restaurants</h1>
                    <p className="lead">Perform an analysis of the most popular restaurants in any location using the zip code.</p>
                </div>
            </div>
        )
    }
}

class ZipCodeBox extends Component {
    render() {
        let handleChangeCb = this.props.handleChangeCb;
        let handleClickCb = this.props.handleClickCb;
        return (
            <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Enter Zip Code or Location, 98105 or Seattle" aria-label="Area Zip Code" aria-describedby="basic-addon2" onChange={curr => handleChangeCb(curr)} />
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={() => handleClickCb()}>Search</button>
                </div>
            </div>
        )
    }
}

class YelpTable extends Component {
    render() {
        let allRestaurants = this.props.rests.map(function (r, i) {
            return <Restaurant key={'restaurant' + i} restaurant={r} />
        })
        return (
            <table className="table table-bordered">
                <TableHeader cols={['Name', 'Rating', 'Price', 'Phone', 'Status']} />
                <tbody>
                    {allRestaurants}
                </tbody>
            </table>
        )
    }
}

class TableHeader extends Component {
    render() {
        return (
            <thead>
                <tr>
                    {
                        this.props.cols.map(function (c, i) {
                            return <th key={'column-' + i}>{c}</th>
                        })
                    }
                </tr>
            </thead>
        )
    }
}

class Restaurant extends Component {
    render() {
        let tel = this.props.restaurant.display_phone;
        let status = 'Open';
        console.log(this.props.restaurant.is_closed)
        console.log(this.props.restaurant);
        if (this.props.restaurant.is_closed) {
            status = 'Closed';
        }
        return (
            <tr>
                <td>{this.props.restaurant.name}</td>
                <td>{this.props.restaurant.rating}</td>
                <td>{this.props.restaurant.price}</td>
                <td><a href={'tel' + tel}>{tel ? tel : 'Not Listed'}</a></td>
                <td>{status}</td>
            </tr>
        )
    }
}

class AnalyzeDataStats extends Component {
    render() {
        let toggle = this.props.toggle;
        let onClick = this.props.onClick;
        return (
            <ButtonDropdown isOpen={this.props.isOpen} toggle={() => toggle()}>
                <DropdownToggle caret>
                    <span
                        onClick={this.toggle}
                        data-toggle="dropdown"
                        aria-haspopup="true"
                    >{this.props.value}
                    </span>
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem onClick={e => onClick(e)}>Rating</DropdownItem>
                    <DropdownItem divider />
                    {this.props.showPrice &&
                        <DropdownItem onClick={e => onClick(e)}>Price</DropdownItem>
                    }
                    <DropdownItem divider />
                    <DropdownItem onClick={e => onClick(e)}>Review Counts</DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
        )
    }
}

class RequestedChart extends Component {

    apiValue(type) {
        if (type === 'Rating') {
            return 'rating';
        } else if (type === 'Price') {
            return 'price'
        } else if (type === 'Review Counts') {
            return 'review_count'
        }
    }

    render() {
        let xAxis = this.apiValue(this.props.XValue);
        let yAxis = this.apiValue(this.props.YValue);
        const data = this.props.rests.map(function (rest, i) {
            let xRequest = rest[xAxis];
            let yRequest = rest[yAxis];
            return {
                x: xRequest,
                y: yRequest
            }
        });
        let xAxisName = this.props.XValue + ": ";
        let yAxisName = this.props.YValue + ": ";
        let graphName = this.props.XValue + " vs " + this.props.YValue;
        return (
            <ScatterChart width={1000} height={350}
                margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name={xAxisName} unit='' />
                <YAxis dataKey="y" name={yAxisName} unit='' />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name={graphName} data={data} fill="#8884d8" />
            </ScatterChart>
        )
    }
}

export default App;