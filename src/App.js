import React, { Component } from 'react';
import _ from 'lodash';
import 'antd/dist/antd.css';
import { Table, Input, Button, Icon, Select, Row, Col, Slider, Pagination, Radio, Tooltip, Form } from 'antd';
const FormItem = Form.Item;
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
      isDifficultyRange: false,
      loading: true,
    };
  }

  getData() {
    this.setState({ loading: true });
    const url =
      "https://raw.githubusercontent.com/alanbuchanan/cello-pieces/master/cello.json";

    fetch(url)
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          loading: false,
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
    setTimeout(() => this.getData(), 200)
  }

  onDifficultySliderChange = (arr) => {
    this.setState({
      minDifficulty: arr[0],
      maxDifficulty: arr[1]
    });
  }

  getDifficultyColor(num) {
    const colors = {
      1: '#00d145',
      2: '#29d100',
      3: '#29d100',
      4: '#29d100',
      5: '#29d100',
      6: '#d1cd00',
      7: '#d1cd00',
      8: '#d1cd00',
      9: '#d1cd00',
      10: '#d10000',
      11: '#d10000',
      12: '#d10000',
      13: '#a00000'
    }
    return {
      color: colors[num]
    }
  }

  alphabeticalSorter(a, b) {
    var nameA = a.toUpperCase();
    var nameB = b.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0;
  }

  render() {
    const linkLayout = {
      style: {
        paddingRight: '10px',
      }
    }

    const columns = [
      {
        title: "Composer",
        dataIndex: "composer",
        key: "composer",
        width: '20%',
        sorter: (a, b) => this.alphabeticalSorter(a.composer, b.composer),
      },
      {
        title: "Piece",
        dataIndex: "piece",
        key: "piece",
        sorter: (a, b) => this.alphabeticalSorter(a.piece, b.piece),
      },
      {
        title: "Publisher",
        dataIndex: "publisher",
        key: "publisher",
        sorter: (a, b) => this.alphabeticalSorter(a.publisher, b.publisher),
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        sorter: (a, b) => this.alphabeticalSorter(a.category, b.category),
      },
      {
        title: "Difficulty",
        dataIndex: "difficulties",
        key: "difficulty",
        render: (item) => <span style={this.getDifficultyColor(_.first(item))}>{item.length > 1 ? `${_.first(item)} - ${_.last(item)}` : _.first(item)}</span>,
        sorter: (a, b) => {
          return a.difficulties[0] - b.difficulties[0] || a.difficulties.length - b.difficulties.length
        },
      },
      {
        title: 'Links',
        key: 'links',
        render: item => <div>
          <span {...linkLayout}><Tooltip placement="bottom" title="Amazon"><a href={`https://www.amazon.co.uk/s/field-keywords=${item.composer}%20${item.piece}%20cello%20sheet%20music`}><Icon type="shopping-cart" /></a></Tooltip></span>
          <span {...linkLayout}><Tooltip placement="bottom" title="IMSLP"><a href={`https://www.google.co.uk/search?q=imslp+${item.composer}+${item.piece}+cello`}><Icon type="book" /></a></Tooltip></span>
          <span>{item.category !== 'Methods/Studies/Scale books' && <Tooltip placement="bottom" title="YouTube"><a href={`https://www.youtube.com/results?search_query=${item.composer}+${item.piece}+cello`}><Icon type="play-circle-o" /></a></Tooltip>}</span>
        </div>
      },
    ];

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };

    const containerLayout = {
      style: {
        padding: '20px',
      }
    };

    return <div {...containerLayout}>
      <FormItem
        {...formItemLayout}
        label="Composer"
      >
        <Select
          style={{ width: 200 }}
          showSearch
          placeholder="Search composer"
          optionFilterProp="children"
          ref={ele => this.composerInput = ele}
          onChange={val => this.onComposerInputChange(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onBlur={this.onSearch}
        >
          {this.state.composers.length > 0 && this.state.composers.map(composer => <Option value={composer}>{composer}</Option>)}
        </Select>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="Piece"
      >
        <Input
          ref={ele => this.pieceInput = ele}
          placeholder="Search piece"
          value={this.state.pieceText}
          onChange={(e) => this.onInputChange(e, 'pieceText')}
          onBlur={this.onSearch}
        />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="Category"
      >
        <Select
          style={{ width: 200 }}
          showSearch
          placeholder="Select a category"
          optionFilterProp="children"
          ref={ele => this.categoryInput = ele}
          onChange={val => this.onCategoryInputChange(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onBlur={this.onSearch}
        >
          {this.state.categories.length > 0 && this.state.categories.map(category => <Option value={category}>{category}</Option>)}
        </Select>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="Publisher"
      >
        <Input
          ref={ele => this.publisherInput = ele}
          placeholder="Search publisher"
          value={this.state.publisherText}
          onChange={(e) => this.onInputChange(e, 'publisherText')}
          onBlur={this.onSearch}
        />
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="Difficulty"
      >
        <Slider
          style={{ width: 200 }}
          range
          min={1}
          max={13}
          defaultValue={[1, 13]}
          onChange={this.onDifficultySliderChange}
          onAfterChange={this.onSearch}
        />
      </FormItem>
      <FormItem
        {...tailFormItemLayout}
      >
        <Button type="primary" onClick={this.onSearch}>Search</Button>
        <Button onClick={this.onReset}>Reset</Button>
      </FormItem>
      <Table
        pagination={{ defaultPageSize: 25 }}
        dataSource={this.state.data}
        columns={columns}
        onChange={this.onChange}
        loading={this.state.loading}
        locale={{
          emptyText: 'Nothing found'
        }}
      />
    </div>
      ;
  }
}

export default App;