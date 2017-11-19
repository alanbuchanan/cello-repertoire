import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { Table, Input, Button, Icon } from 'antd';

class App extends React.Component {
  constructor(props) {
    super()
    this.state = {
      data: [],
      filterDropdownVisible: false,
      searchText: '',
      filtered: false,
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }
  componentDidMount() {
    const url =
      "https://raw.githubusercontent.com/alanbuchanan/cello-pieces/master/cello.json";

    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          data: data,
          originalData: data
        });
      });
  }
  onInputChange(e) {
    this.setState({ searchText: e.target.value });
  }
  onSearch() {
    const { searchText, data, originalData } = this.state;
    const reg = new RegExp(searchText, 'gi');
    console.log('data:', data)
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchText,
      data: originalData.map((record) => {
        const match = record.piece.match(reg);
        if (!match) {
          return null;
        }
        return {
          ...record,
          name: (
            <span>
              {record.piece.split(reg).map((text, i) => (
                i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
              ))}
            </span>
          ),
        };
      }).filter(record => !!record),
    });
  }
  render() {
    const columns = [
      {
        title: "Composer",
        dataIndex: "composer",
        key: "composer"
      },
      {
        title: "Piece",
        dataIndex: "piece",
        key: "piece",
        filterDropdown: (
          <div className="custom-filter-dropdown">
            <Input
              ref={ele => this.searchInput = ele}
              placeholder="Search piece"
              value={this.state.searchText}
              onChange={this.onInputChange}
              onPressEnter={this.onSearch}
            />
            <Button type="primary" onClick={this.onSearch}>Search</Button>
          </div>
        ),
        filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
        filterDropdownVisible: this.state.filterDropdownVisible,
        onFilterDropdownVisibleChange: (visible) => {
          this.setState({
            filterDropdownVisible: visible,
          }, () => this.searchInput && this.searchInput.focus());
        },
      },
      {
        title: "Publisher",
        dataIndex: "publisher",
        key: "publisher"
      },
      {
        title: "Difficulty",
        dataIndex: "difficulties",
        key: "difficulty"
      }
    ];

    return <Table dataSource={this.state.data} columns={columns} />;
  }
}

class AppContainer extends React.Component {
  constructor() {
    super();
    this.state = {
      data: []
    };
  }
  componentDidMount() {
    const url =
      "https://raw.githubusercontent.com/alanbuchanan/cello-pieces/master/cello.json";

    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        this.setState({ data: data });
      });
  }

  render() {
    return (
      <div>
        {this.state.data.length === 0 ? null : <App data={this.state.data} />}
      </div>
    );
  }
}

export default App;