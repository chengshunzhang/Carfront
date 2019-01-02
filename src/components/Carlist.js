import React, {Component} from 'react';
import {SERVER_URL} from '../constants.js'
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddCar from './AddCar.js';
import {CSVLink} from 'react-csv';

class Carlist extends Component {
    constructor(props) {
        super(props);
        this.state = {cars: []};
    }

    componentDidMount() {
        this.fetchCars();
    }

    fetchCars = () => {
        fetch(SERVER_URL + 'api/cars')
        .then((response) => response.json())
        .then((responseData) => {
            this.setState({cars: responseData._embedded.cars})
        })
        .catch(err => console.error(err));
    }

    // delete car
    onDelClick = (link) => {
        fetch(link, {method: 'DELETE'})
        .then(res => {
            toast.success("Car deleted", {
                position: toast.POSITION.BOTTOM_LEFT
            });
            this.fetchCars()
        })
        .catch(err => {
            toast.error('Error when deleting', {
                position: toast.POSITION.BOTTOM_LEFT
            });
            console.log(err)
        });
    }

    confirmDelete = (link) => {
        confirmAlert({
            message: 'Are you sure to delete?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.onDelClick(link)
                }, {
                    label: 'No'
                }
            ]
        })
    }

    // add new car
    addCar = (car) => {
        fetch(SERVER_URL + 'api/cars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(car)
        })
        .then(res => this.fetchCars())
        .catch(err => console.log(err));
    }

    renderEditable = (cellInfo) => {
        return (
            <div
                style={{backgroundColor: "#fcfcfc"}}
                contentEditable
                suppressContentEditableWarning
                onBlur={e => {
                    const data = [...this.state.cars];
                    data[cellInfo.index][cellInfo.column.id] =
                    e.target.innerHTML;
                    this.setState({cars: data});
                }}
                dangerouslySetInnerHTML={{
                    __html: this.state.cars[cellInfo.index][cellInfo.column.id]
                }}
            />
        );
    }

    // update car
    updateCar = (link, car) => {
        fetch(link, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(car)
        })
        .then(res =>
            toast.success("Change saved", {
                position: toast.POSITION.BOTTOM_LEFT
            })
        )
        .catch(err =>
            toast.error("Error when saving", {
                position: toast.POSITION.BOTTOM_LEFT
            })
        )
    }

    render() {
        const columns = [{
            Header: 'Brand',
            accessor: 'brand',
            Cell: this.renderEditable
        }, {
            Header: 'Model',
            accessor: 'model',
            Cell: this.renderEditable
        }, {
            Header: 'Color',
            accessor: 'color',
            Cell: this.renderEditable
        }, {
            Header: 'Year',
            accessor: 'year',
            Cell: this.renderEditable
        }, {
            Header: 'Price $',
            accessor: 'price',
            Cell: this.renderEditable
        }, {
            id: 'delbutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({value}) => (<button
            onClick={() => {this.confirmDelete(value)}}>
            Delete
            </button>)
        }, {
            id: 'savebutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({value, row}) => (
                <button onClick={() => this.updateCar(value, row)}>
                    Save
                </button>
            )
        }]
        return (
            <div className='App'>
                <CSVLink data={this.state.cars} separator=';'>Export CSV</CSVLink>
                <AddCar addCar={this.addCar} fetchCars={this.fetchCars}/>
                <ReactTable data={this.state.cars} columns={columns}
                filterable={true}/>
                <ToastContainer autoClose={2000}/>
            </div>
        );
    }
}

export default Carlist;