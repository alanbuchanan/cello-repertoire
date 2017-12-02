import React, { Component } from 'react';
import _ from 'lodash';
import 'antd/dist/antd.css';
import { Table, Input, Button, Icon, Select, Slider, Tooltip, Form } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

class App extends Component {

  state = {
    data: [],
    pieceText: '',
    composerText: '',
    categoryText: '',
    publisherText: '',
    filtered: false,
    composers: [],
    categories: [],
    minDifficulty: 1,
    maxDifficulty: 13,
    loading: true,
  };

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
            .sort((a, b) => this.alphabeticalSorter(a, b)),
          categories: _
            .chain(data)
            .reduce((acc, cur) => {
              return acc.concat(cur.category)
            }, [])
            .uniq()
            .value()
            .sort((a, b) => this.alphabeticalSorter(a, b)),
        });
      });
  }

  componentDidMount() {
    this.getData();
  }

  onInputChange = (e, prop) => {
    this.setState({ [prop]: e.target.value });
    this.triggerDelayedSearch();
  }

  onComposerInputChange = (val) => {
    this.setState({ composerText: val });
    this.triggerDelayedSearch();
  }

  onCategoryInputChange = (val) => {
    this.setState({ categoryText: val });
    this.triggerDelayedSearch();
  }

  emptyStateFieldAndUpdateTable(field) {
    this.setState({ [field]: '' });
    this.triggerDelayedSearch();
  }

  triggerDelayedSearch() {
    setTimeout(() => this.onSearch(), 100)
  }

  onSearch = () => {
    const { pieceText, composerText, categoryText, publisherText, originalData, minDifficulty, maxDifficulty } = this.state;
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
          && (
            _.range(minDifficulty, maxDifficulty + 1).includes(_.first(record.difficulties)) ||
            _.range(minDifficulty, maxDifficulty + 1).includes(_.last(record.difficulties))
          )

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
    this.setState({
      pieceText: '',
      composerText: '',
      categoryText: '',
      publisherText: '',
      minDifficulty: 1,
      maxDifficulty: 12,
    });
    this.triggerDelayedSearch()
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

    const iconLayout = {
      style: {
        fontSize: '16px',
      }
    }

    const columns = [
      {
        title: "Composer",
        dataIndex: "composer",
        key: "composer",
        width: '15%',
        sorter: (a, b) => this.alphabeticalSorter(a.composer, b.composer),
      },
      {
        title: "Piece",
        dataIndex: "piece",
        key: "piece",
        width: '25%',
        sorter: (a, b) => this.alphabeticalSorter(a.piece, b.piece),
      },
      {
        title: "Publisher",
        dataIndex: "publisher",
        key: "publisher",
        width: '15%',
        sorter: (a, b) => this.alphabeticalSorter(a.publisher, b.publisher),
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        width: '25%',
        sorter: (a, b) => this.alphabeticalSorter(a.category, b.category),
      },
      {
        title: "Difficulty",
        dataIndex: "difficulties",
        key: "difficulty",
        width: '8%',
        render: (item) => <span style={this.getDifficultyColor(_.first(item))}>{item.length > 1 ? `${_.first(item)} - ${_.last(item)}` : _.first(item)}</span>,
        sorter: (a, b) => {
          return a.difficulties[0] - b.difficulties[0] || a.difficulties.length - b.difficulties.length
        },
      },
      {
        title: 'Links',
        key: 'links',
        width: '15%',
        render: item => <div>
          <span {...linkLayout}>
            <Tooltip placement="bottom" title="Amazon">
              <a href={`https://www.amazon.com/s/field-keywords=${item.composer}%20${item.piece}%20cello%20sheet%20music`}>
                <Icon {...iconLayout} type="shopping-cart" />
              </a>
            </Tooltip>
          </span>
          <span {...linkLayout}>
            <Tooltip placement="bottom" title="IMSLP">
              <a href={`https://www.google.co.uk/search?q=imslp+${item.composer}+${item.piece}+cello`}>
                <Icon {...iconLayout} type="book" />
              </a>
            </Tooltip>
          </span>
          <span>
            {item.category !== 'Methods/Studies/Scale books' && (
              <Tooltip placement="bottom" title="YouTube">
                <a href={`https://www.youtube.com/results?search_query=${item.composer}+${item.piece}+cello`}>
                  <Icon {...iconLayout} type="play-circle-o" />
                </a>
              </Tooltip>)}
          </span>
        </div>
      },
    ];

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
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
          offset: 2,
        },
      },
    };

    const containerLayout = {
      style: {
        padding: '20px 80px 60px',
        maxWidth: '1500px',
        margin: '0 auto'
      }
    };

    const inputWithRemoveIconLayout = {
      style: {
        width: '50%',
        marginRight: '8px',
      }
    }

    const deleteIconProps = {
      style: {
        cursor: 'pointer',
      },
      className: "dynamic-delete-button",
      type: "minus-circle-o",
    }

    return <div {...containerLayout}>
      <h1 style={{ marginBottom: '20px' }}>Cello Repertoire Search</h1>

      <FormItem
        {...formItemLayout}
        label="Composer"
      >
        <Select
          value={this.state.composerText || undefined}
          showSearch
          placeholder="Search composer"
          optionFilterProp="children"
          ref={ele => this.composerInput = ele}
          onChange={val => this.onComposerInputChange(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onBlur={this.onSearch}
          {...inputWithRemoveIconLayout}
        >
          {this.state.composers.length > 0 && this.state.composers.map(composer => <Option key={composer} value={composer}>{composer}</Option>)}
        </Select>
        <Icon
          {...deleteIconProps}
          onClick={() => this.emptyStateFieldAndUpdateTable('composerText')}
        />
      </FormItem>

      <FormItem
        {...formItemLayout}
        label="Piece"
      >
        <Input
          value={this.state.pieceText}
          ref={ele => this.pieceInput = ele}
          placeholder="Search piece"
          onChange={(e) => this.onInputChange(e, 'pieceText')}
          onBlur={this.onSearch}
          {...inputWithRemoveIconLayout}
        />
        <Icon
          {...deleteIconProps}
          onClick={() => this.emptyStateFieldAndUpdateTable('pieceText')}
        />
      </FormItem>

      <FormItem
        {...formItemLayout}
        label="Category"
      >
        <Select
          value={this.state.categoryText || undefined}
          showSearch
          placeholder="Select a category"
          optionFilterProp="children"
          ref={ele => this.categoryInput = ele}
          onChange={val => this.onCategoryInputChange(val)}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onBlur={this.onSearch}
          {...inputWithRemoveIconLayout}
        >
          {this.state.categories.length > 0 && this.state.categories.map(category => <Option key={category} value={category}>{category}</Option>)}
        </Select>
        <Icon
          {...deleteIconProps}
          onClick={() => this.emptyStateFieldAndUpdateTable('categoryText')}
        />
      </FormItem>

      <FormItem
        {...formItemLayout}
        label="Publisher"
      >
        <Input
          value={this.state.publisherText}
          ref={ele => this.publisherInput = ele}
          placeholder="Search publisher"
          onChange={(e) => this.onInputChange(e, 'publisherText')}
          onBlur={this.onSearch}
          {...inputWithRemoveIconLayout}
        />
        <Icon
          {...deleteIconProps}
          onClick={() => this.emptyStateFieldAndUpdateTable('publisherText')}
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
        <Button type="primary" onClick={this.onSearch} style={{ marginRight: '20px' }}>Search</Button>
        <Button onClick={this.onReset}>Reset</Button>
      </FormItem>

      <Table
        pagination={{ defaultPageSize: 25 }}
        dataSource={this.state.data}
        columns={columns}
        onChange={this.onChange}
        loading={this.state.loading}
        locale={{
          emptyText: this.state.loading ? '' : 'Nothing found'
        }}
        rowKey={record => record.piece + record.composer + record.category}
      />

      <footer style={{ color: 'lightgrey', display: 'flex', flexDirection: 'column', fontSize: 8 }}>
        <div>Cello Repertoire Search built by <a href="https://github.com/alanbuchanan" style={{ color: 'gray' }}>Rory Smith</a></div>
        <div>Data from <a href="http://www.cello.org/Libraries/references/syllabus.html" style={{ color: 'gray' }}>cello.org</a></div>
        <div>
          <a href="https://www.paypal.me/rorysmith123" style={{ color: 'gray' }}>Donate <Icon type="heart-o" style={{ color: '#bc2121' }} /></a>
        </div>
      </footer>

    </div>
      ;
  }
}

export default App;