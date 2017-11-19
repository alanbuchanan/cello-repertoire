import React, { Component } from 'react';
import _ from 'lodash';
import 'antd/dist/antd.css';
import { Table, Input, Button, Icon, Select } from 'antd';
const Option = Select.Option;

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      data: [],
      filterDropdownVisible: false,
      pieceText: '',
      composerText: '',
      publisherText: '',
      filtered: false,
      composers: [],
    };

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
          originalData: data,
          composers: _
            .chain(data)
            .reduce((acc, cur) => {
              return acc.concat(cur.composer)
            }, [])
            .uniq()
            .value()
            .sort()
        });
      });
  }
  onInputChange = (e, prop) => {
    this.setState({ [prop]: e.target.value });
  }
  onComposerInputChange = (val) => {
    this.setState({ composerText: val });
  }
  onSearch() {
    const { pieceText, composerText, publisherText, data, originalData } = this.state;
    const regPiece = new RegExp(pieceText, 'gi');
    const regComposer = new RegExp(composerText, 'gi');
    const regPublisher = new RegExp(publisherText, 'gi');

    this.setState({
      filterDropdownVisible: false,
      filtered: !!pieceText,
      data: originalData.map((record) => {
        const match = record.piece.match(regPiece) && record.composer.match(regComposer) && record.publisher.match(regPublisher);
        if (!match) {
          return null;
        }
        return {
          ...record,
          name: (
            <span>
              {/* {record.piece.split(reg).map((text, i) => (
                i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
              ))} */}
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
      },
      {
        title: "Publisher",
        dataIndex: "publisher",
        key: "publisher"
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category"
      },
      {
        title: "Difficulty",
        dataIndex: "difficulties",
        key: "difficulty"
      }
    ];

    return <div>
      <Input
        ref={ele => this.pieceInput = ele}
        placeholder="Search piece"
        value={this.state.pieceText}
        onChange={(e) => this.onInputChange(e, 'pieceText')}
        onPressEnter={this.onSearch}
      />
      <Select
        showSearch
        style={{ width: 200 }}
        placeholder="Select a composer"
        optionFilterProp="children"
        ref={ele => this.composerInput = ele}
        onChange={(e) => this.onComposerInputChange(e, 'composerText')}
        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}        
      >
        {this.state.composers.length > 0 && this.state.composers.map(composer => <Option value={composer}>{composer}</Option>)}
      </Select>
      <Input
        ref={ele => this.publisherInput = ele}
        placeholder="Search publisher"
        value={this.state.publisherText}
        onChange={(e) => this.onInputChange(e, 'publisherText')}
        onPressEnter={this.onSearch}
      />
      <Button onClick={this.onSearch}>Search</Button>
      <Table pagination={false} dataSource={this.state.data} columns={columns} />
    </div>
      ;
  }
}

export default App;