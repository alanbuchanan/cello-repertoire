import React, { Component } from 'react';
import _ from 'lodash';
import 'antd/dist/antd.css';
import { Table, Input, Button, Icon, Select, Slider, Tooltip, Form } from 'antd';
import { Accordion, List } from 'antd-mobile';
import 'antd-mobile/dist/antd-mobile.css';
const FormItem = Form.Item;
const Item = List.Item;
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
    visible: false,
    selected: ''
  };

  onSelect = (opt) => {
    this.setState({
      visible: false,
      selected: opt.props.value,
    });
  };

  handleVisibleChange = (visible) => {
    this.setState({
      visible,
    });
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

  isDeviceMobile() {
    return /Android|BB10|PlayBook|webOS|iPhone|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent)
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

    const iconLayoutMobile = {
      style: {
        fontSize: '20px',
        marginRight: '10px',
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

    const inputWithRemoveIconLayoutMobile = {
      style: {
        width: '90%',
        marginRight: '8px',
        fontSize: '20px',
      }
    }

    const deleteIconProps = {
      style: {
        cursor: 'pointer',
      },
      className: "dynamic-delete-button",
      type: "minus-circle-o",
    }

    const formItems = (layout) => {
      return ([
        <FormItem
          {...formItemLayout}
          label="Composer"
          key={'11231'}
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
            {...layout}
          >
            {this.state.composers.length > 0 && this.state.composers.map(composer => <Option key={composer} value={composer}>{composer}</Option>)}
          </Select>
          <Icon
            {...deleteIconProps}
            onClick={() => this.emptyStateFieldAndUpdateTable('composerText')}
          />
        </FormItem>,

        <FormItem
          {...formItemLayout}
          label="Piece"
          key={'11232'}
        >
          <Input
            value={this.state.pieceText}
            ref={ele => this.pieceInput = ele}
            placeholder="Search piece"
            onChange={(e) => this.onInputChange(e, 'pieceText')}
            onBlur={this.onSearch}
            {...layout}
          />
          <Icon
            {...deleteIconProps}
            onClick={() => this.emptyStateFieldAndUpdateTable('pieceText')}
          />
        </FormItem>,

        <FormItem
          {...formItemLayout}
          label="Category"
          key={'11233'}
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
            {...layout}
          >
            {this.state.categories.length > 0 && this.state.categories.map(category => <Option key={category} value={category}>{category}</Option>)}
          </Select>
          <Icon
            {...deleteIconProps}
            onClick={() => this.emptyStateFieldAndUpdateTable('categoryText')}
          />
        </FormItem>,

        <FormItem
          {...formItemLayout}
          label="Publisher"
          key={'11234'}
        >
          <Input
            value={this.state.publisherText}
            ref={ele => this.publisherInput = ele}
            placeholder="Search publisher"
            onChange={(e) => this.onInputChange(e, 'publisherText')}
            onBlur={this.onSearch}
            {...layout}
          />
          <Icon
            {...deleteIconProps}
            onClick={() => this.emptyStateFieldAndUpdateTable('publisherText')}
          />
        </FormItem>,

        <FormItem
          {...formItemLayout}
          label="Difficulty"
          key={'11235'}
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
        </FormItem>,

        <FormItem
          {...tailFormItemLayout}
          key={'11236'}
        >
          <Button type="primary" onClick={this.onSearch} style={{ marginRight: '20px' }}>Search</Button>
          <Button onClick={this.onReset}>Reset</Button>
        </FormItem>])
    }

    const footer = (extraStyles = {}) => (
      <footer style={{ color: 'lightgrey', display: 'flex', flexDirection: 'column', fontSize: 8, ...extraStyles }}>
        <div>Cello Repertoire Search built by <a href="https://github.com/alanbuchanan" style={{ color: 'gray' }}>Rory Smith</a></div>
        <div>Data from <a href="http://www.cello.org/Libraries/references/syllabus.html" style={{ color: 'gray' }}>cello.org</a></div>
        <div>
          <a href="https://www.paypal.me/rorysmith123" style={{ color: 'gray' }}>Donate <Icon type="heart-o" style={{ color: '#bc2121' }} /></a>
        </div>
      </footer>
    )

    const heading = () => (
      <h1 style={{ marginBottom: '20px' }}>Cello Repertoire Search</h1>
    )

    const mobileSectionBgColor = { backgroundColor: '#eee' }

    // MOBILE
    if (this.isDeviceMobile()) {
      return <div>
        <div style={{ padding: '0 10px' }}>
          {heading()}
        </div>
        <div style={{ padding: '0 10px' }}>
          {formItems(inputWithRemoveIconLayoutMobile)}
        </div>

        <Accordion className="my-accordion">
          {this.state.data.map((item, i) => <Accordion.Panel
            key={item.piece + item.composer + item.category + i}
            header={<span><span style={this.getDifficultyColor(_.first(item.difficulties))}>•</span> {`${item.composer} - ${item.piece}`}</span>} className="pad">
            <List className="my-list">
              <Item wrap multipleLine extra={`${item.category}`} style={mobileSectionBgColor}>Category</Item>
              <Item extra={<span style={this.getDifficultyColor(_.first(item.difficulties))}>{item.difficulties.length > 1 ? `${_.first(item.difficulties)} - ${_.last(item.difficulties)}` : _.first(item.difficulties)}</span>} style={{ backgroundColor: '#eee' }}>Difficulty</Item>
              <Item extra={`${item.publisher}`} style={mobileSectionBgColor}>Publisher</Item>
              <Item wrap multipleLine extra={<div>
                <span {...linkLayout}>
                  <Tooltip placement="bottom" title="Amazon">
                    <a href={`https://www.amazon.com/s/field-keywords=${item.composer}%20${item.piece}%20cello%20sheet%20music`}>
                      <Icon {...iconLayoutMobile} type="shopping-cart" />
                    </a>
                  </Tooltip>
                </span>
                <span {...linkLayout}>
                  <Tooltip placement="bottom" title="IMSLP">
                    <a href={`https://www.google.co.uk/search?q=imslp+${item.composer}+${item.piece}+cello`}>
                      <Icon {...iconLayoutMobile} type="book" />
                    </a>
                  </Tooltip>
                </span>
                <span>
                  {item.category !== 'Methods/Studies/Scale books' && (
                    <Tooltip placement="bottom" title="YouTube">
                      <a href={`https://www.youtube.com/results?search_query=${item.composer}+${item.piece}+cello`}>
                        <Icon {...iconLayoutMobile} type="play-circle-o" />
                      </a>
                    </Tooltip>)}
                </span>
              </div>}
                style={mobileSectionBgColor}
              >Links</Item>
            </List>
          </Accordion.Panel>)}
        </Accordion>

        {footer({ padding: '20px' })}
      </div>
    }

    // DESKTOP
    return <div {...containerLayout}>
      {heading()}

      {formItems(inputWithRemoveIconLayout)}

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
      {footer()}
    </div>
      ;
  }
}

export default App;