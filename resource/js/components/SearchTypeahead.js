import React from 'react';
import PropTypes from 'prop-types';

import { noop } from 'lodash/noop';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import UserPicture from './User/UserPicture';
import PageListMeta from './PageList/PageListMeta';
import PagePath from './PageList/PagePath';

export default class SearchTypeahead extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      input: this.props.keywordOnInit,
      keyword: '',
      searchedKeyword: '',
      pages: [],
      isLoading: false,
      searchError: null,
    };
    this.crowi = this.props.crowi;
    this.emptyLabel = props.emptyLabel;

    this.search = this.search.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onChange = this.onChange.bind(this);
    this.dispatchSubmit = this.dispatchSubmit.bind(this);
    this.getRestoreFormButton = this.getRestoreFormButton.bind(this);
    this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
    this.restoreInitialData = this.restoreInitialData.bind(this);
    this.getTypeahead = this.getTypeahead.bind(this);
  }

  /**
   * Get instance of AsyncTypeahead
   */
  getTypeahead() {
    return this.refs.typeahead ? this.refs.typeahead.getInstance() : null;
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  search(keyword) {

    if (keyword === '') {
      this.setState({
        keyword: '',
        searchedKeyword: '',
      });
      return;
    }

    this.setState({isLoading: true});

    this.crowi.apiGet('/search', {q: keyword})
      .then(res => { this.onSearchSuccess(res) })
      .catch(err => { this.onSearchError(err) });
  }

  /**
   * Callback function which is occured when search is exit successfully
   * @param {*} pages
   */
  onSearchSuccess(res) {
    this.setState({
      isLoading: false,
      keyword: '',
      pages: res.data,
    });
    this.props.onSearchSuccess && this.props.onSearchSuccess(res);
  }

  /**
   * Callback function which is occured when search is exit abnormaly
   * @param {*} err
   */
  onSearchError(err) {
    this.setState({
      isLoading: false,
      searchError: err,
    });
    this.props.onSearchError && this.props.onSearchError(err);
  }

  onInputChange(text) {
    this.setState({input: text});
    if (text === '') {
      this.setState({pages: []});
    }
  }

  onKeyDown(event) {
    if (event.keyCode === 13) {
      this.dispatchSubmit();
    }
  }

  onChange(selected) {
    const page = selected[0];  // should be single page selected

    // navigate to page
    if (page != null) {
      window.location = page.path;
    }
  }

  dispatchSubmit() {
    if (this.props.onSubmit != null) {
      this.props.onSubmit(this.state.keyword);
    }
  }

  renderMenuItemChildren(option, props, index) {
    const page = option;
    return (
      <span>
      <UserPicture user={page.lastUpdateUser} size="sm" />
      <PagePath page={page} />
      <PageListMeta page={page} />
      </span>
    );
  }

  /**
   * Initialize keyword
   */
  restoreInitialData() {
    this.refs.typeahead.getInstance().clear();
    this.refs.typeahead.getInstance()._updateText(this.props.keywordOnInit);
  }

  /**
   * Get restore form button to initialize button
   */
  getRestoreFormButton() {
    let isHidden = (this.state.input === this.props.keywordOnInit);

    return isHidden ? <span></span> : (
      <button type="button" className="btn btn-link search-clear" onMouseDown={this.restoreInitialData}>
        <i className="icon-close" />
      </button>
    );
  }

  render() {
    const emptyLabel = (this.state.searchError !== null)
      ? 'Error on searching.'
      : 'No matches found on title...';
    const restoreFormButton = this.getRestoreFormButton();
    const defaultSelected = (this.props.keywordOnInit != '')
      ? [{path: this.props.keywordOnInit}]
      : [];
    const help = this.getHelpElement();

    return (
      <div className="search-typeahead">
        <AsyncTypeahead
          {...this.props}
          ref="typeahead"
          inputProps={{name: 'q', autoComplete: 'off'}}
          isLoading={this.state.isLoading}
          labelKey="path"
          minLength={0}
          options={this.state.pages} // Search result (Some page names)
          emptyLabel={this.emptyLabel ? this.emptyLabel : emptyLabel}
          align='left'
          submitFormOnEnter={true}
          onSearch={this.search}
          onInputChange={this.onInputChange}
          onKeyDown={this.onKeyDown}
          renderMenuItemChildren={this.renderMenuItemChildren}
          caseSensitive={false}
          defaultSelected={defaultSelected}
          promptText={help}
        />
        {restoreFormButton}
      </div>
    );
  }

  getHelpElement() {
    // TODO disabled temporary -- 2018.07.20 Yuki Takei
    return <span>(TBD) Show Help</span>;
    // return <table className="table table-borderd search-help">
    //           <caption className="text-center">Search Help</caption>
    //           <tr>
    //             <td className="text-center">keyword</td>
    //             <th>記事名 or カテゴリ or 本文にkeywordを含む</th>
    //           </tr>
    //           <tr>
    //             <td className="text-center">title:keyword</td>
    //             <th>記事名にkeywordを含む</th>
    //           </tr>
    //           <tr>
    //             <td className="text-center">a b</td>
    //             <th>文字列aとbを含む(スペース区切り)</th>
    //           </tr>
    //           <tr>
    //             <td className="text-center">-keyword</td>
    //             <th>文字列keywordを含まない</th>
    //           </tr>
    //         </table>;
  }
}

/**
 * Properties
 */
SearchTypeahead.propTypes = {
  crowi:           PropTypes.object.isRequired,
  onSearchSuccess: PropTypes.func,
  onSearchError:   PropTypes.func,
  onChange:        PropTypes.func,
  onSubmit:        PropTypes.func,
  emptyLabel:      PropTypes.string,
  placeholder:     PropTypes.string,
  keywordOnInit:   PropTypes.string,
};

/**
 * Properties
 */
SearchTypeahead.defaultProps = {
  onSearchSuccess: noop,
  onSearchError:   noop,
  onChange:        noop,
  emptyLabel:      null,
  placeholder:     '',
  keywordOnInit:   '',
};
