import React, {Component} from 'react';
import {SERVER_URL} from '../constants.js'
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import AddCar from './AddCar.js';
import {CSVLink} from 'react-csv';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import SnackBar from '@material-ui/core/Snackbar';

class Carlist extends Component {
    constructor(props) {
        super(props);
        this.state = {cars: [], open: false, message: ''};
    }

    componentDidMount() {
        this.fetchCars();
    }

    fetchCars = () => {
        const token = sessionStorage.getItem('jwt');
        fetch(SERVER_URL + 'api/cars', {
            headers: {'Authorization': token}
        })
        .then((response) => response.json())
        .then((responseData) => {
            this.setState({cars: responseData._embedded.cars})
        })
        .catch(err => console.error(err));
    }

    // delete car
    onDelClick = (link) => {
        const token = sessionStorage.getItem('jwt');
        fetch(link, {
            method: 'DELETE',
            headers: {'Authorization': token}
        })
        .then(res => {
            this.setState({open: true, message: 'Car deleted'});
            this.fetchCars()
        })
        .catch(err => {
            this.setState({open: true, message: 'Error when deleting'});
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
        const token = sessionStorage.getItem('jwt');
        fetch(SERVER_URL + 'api/cars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
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
        const token = sessionStorage.getItem('jwt');
        fetch(link, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(car)
        })
        .then(res =>
            this.setState({open: true, message: 'Changes saved'})
        )
        .catch(err =>
            this.setState({open: true, message: 'Error when saving'})
        )
    }

    handleClose = (event, reason) => {
        this.setState({open: false});
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
            Cell: ({value}) => (<Button size='small' variant='flat' color='secondary'
            onClick={() => {this.confirmDelete(value)}}>
                Delete
            </Button>)
        }, {
            id: 'savebutton',
            sortable: false,
            filterable: false,
            width: 100,
            accessor: '_links.self.href',
            Cell: ({value, row}) => (
                <Button size='small' variant='flat' color='primary'
                onClick={() => this.updateCar(value, row)}>
                    Save
                </Button>
            )
        }]
        return (
            <div className='App'>
                <Grid container>
                    <Grid item>
                        <AddCar addCar={this.addCar} fetchCars={this.fetchCars}/>
                    </Grid>
                    <Grid item style={{padding: 20}}>
                        <CSVLink data={this.state.cars} separator=';'>Export CSV</CSVLink>
                    </Grid>
                    <Grid item>
                        <h3>Hello, {this.props.user}</h3>
                    </Grid>
                </Grid>

                <ReactTable data={this.state.cars} columns={columns}
                filterable={true}/>
                <SnackBar
                open={this.state.open} onClose={this.handleClose}
                autoHideDuration={1000} message={this.state.message}/>
            </div>
        );
    }
}

export default Carlist;