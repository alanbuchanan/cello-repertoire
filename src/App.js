import React, { Component } from 'react';
import _ from 'lodash';
import 'antd/dist/antd.css';
import { Table, Input, Button, Icon, Select, Row, Col, Slider } from 'antd';
const Option = Select.Option;

class App extends Component {
  constructor() {
    super();
    this.setInitialState();
  }

  setInitialState() {
    this.state = {
      data: [],
      pieceText: '',
      composerText: '',
      categoryText: '',
      publisherText: '',
      filtered: false,
      composers: [],
      categories: [],
      minDifficulty: 1,
      maxDifficulty: 12,
    };
  }

  getData() {
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
            .sort(),
          categories: _
            .chain(data)
            .reduce((acc, cur) => {
              return acc.concat(cur.category)
            }, [])
            .uniq()
            .value()
            .sort()
        });
      });
  }

  componentDidMount() {
    this.getData();
  }
  onInputChange = (e, prop) => {
    this.setState({ [prop]: e.target.value });
  }
  onComposerInputChange = (val) => {
    this.setState({ composerText: val });
  }
  onCategoryInputChange = (val) => {
    this.setState({ categoryText: val });
  }
  onSearch = () => {
    const { pieceText, composerText, categoryText, publisherText, data, originalData, minDifficulty, maxDifficulty } = this.state;
    const regPiece = new RegExp(pieceText, 'gi');
    const regComposer = new RegExp(composerText, 'gi');
    const regPublisher = new RegExp(publisherText, 'gi');
    const regCategory = new RegExp(categoryText, 'gi');



    this.setState({
      filterDropdownVisible: false,
      filtered: !!pieceText,
      data: originalData.map((record) => {
        const match = record.piece.match(regPiece)
          && record.composer.match(regComposer)
          && record.publisher.match(regPublisher)
          && record.category.match(regCategory)
          && _.first(record.difficulties) >= minDifficulty && _.last(record.difficulties) <= maxDifficulty

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

  onReset = () => {
    this.setInitialState();
    this.getData();
  }

  onDifficultySliderChange = (arr) => {
    this.setState({
      minDifficulty: arr[0],
      maxDifficulty: arr[1]
    });
  }

  render() {
    const columns = [
      {
        title: "Composer",
        dataIndex: "composer",
        key: "composer",
        width: '20%',
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
        key: "difficulty",
        render: (item) => <span>{item.length > 1 ? `${_.first(item)} - ${_.last(item)}` : _.first(item)}</span>
      },
      {
        title: '',
        key: 'amazon_link',
        render: item => <a href={`https://www.amazon.co.uk/s/field-keywords=${item.composer}%20${item.piece}%20sheet%20music`}><Icon type="shopping-cart" /></a>
      },
      {
        title: '',
        key: 'imslp_link',
        render: item => <a href={`https://www.google.co.uk/search?q=imslp+${item.composer}+${item.piece}`}><Icon type="book" /></a>
      }
    ];

    return <div>
      <Row gutter={10}>
        <Select
          style={{ width: 200, margin: 20 }}
          showSearch
          placeholder="Search composer"
          optionFilterProp="children"
          ref={ele => this.composerInput = ele}
          onChange={val => this.onComposerInputChange(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {this.state.composers.length > 0 && this.state.composers.map(composer => <Option value={composer}>{composer}</Option>)}
        </Select>
      </Row>
      <Row gutter={10}>
        <Input
          style={{ width: 200, margin: 20 }}
          ref={ele => this.pieceInput = ele}
          placeholder="Search piece"
          value={this.state.pieceText}
          onChange={(e) => this.onInputChange(e, 'pieceText')}
          onPressEnter={this.onSearch}
        />
      </Row>
      <Row gutter={10}>
        <Select
          style={{ width: 200, margin: 20 }}
          showSearch
          placeholder="Select a category"
          optionFilterProp="children"
          ref={ele => this.categoryInput = ele}
          onChange={val => this.onCategoryInputChange(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {this.state.categories.length > 0 && this.state.categories.map(category => <Option value={category}>{category}</Option>)}
        </Select>
      </Row>
      <Row gutter={10}>
        <Input
          style={{ width: 200, margin: 20 }}
          ref={ele => this.publisherInput = ele}
          placeholder="Search publisher"
          value={this.state.publisherText}
          onChange={(e) => this.onInputChange(e, 'publisherText')}
          onPressEnter={this.onSearch}
        />
      </Row>
      <Row gutter={10}>
        <label>Select difficulty:</label>
        <Slider style={{ width: 200 }} range min={1} max={12} defaultValue={[1, 12]} onAfterChange={this.onDifficultySliderChange} />
      </Row>
      <Button type="primary" onClick={this.onSearch}>Search</Button>
      <Button onClick={this.onReset}>Reset</Button>
      <Table
        pagination={false}
        dataSource={this.state.data}
        columns={columns}
        onRowDoubleClick={item => window.location.href = `https://www.google.co.uk/search?q=imslp+${item.composer}+${item.piece}`}
      />
    </div>
      ;
  }
}

export default App;