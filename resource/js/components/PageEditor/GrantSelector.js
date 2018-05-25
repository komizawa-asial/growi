import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ListGroup from 'react-bootstrap/es/ListGroup';
import ListGroupItem from 'react-bootstrap/es/ListGroupItem';
import Modal from 'react-bootstrap/es/Modal';

const SPECIFIED_GROUP_VALUE = 'specifiedGroup';

/**
 * Page grant select component
 *
 * @export
 * @class GrantSelector
 * @extends {React.Component}
 */
class GrantSelector extends React.Component {

  constructor(props) {
    super(props);

    this.availableGrants = [
      { pageGrant: 1, iconClass: 'icon-people', styleClass: '', label: 'Public' },
      { pageGrant: 2, iconClass: 'icon-link', styleClass: 'text-info', label: 'Anyone with the link' },
      // { pageGrant: 3, iconClass: '', label: 'Specified users only' },
      { pageGrant: 4, iconClass: 'icon-lock', styleClass: 'text-danger', label: 'Just me' },
      { pageGrant: 5, iconClass: 'icon-options', styleClass: '', label: 'Only inside the group' },  // appeared only one of these 'pageGrant: 5'
      { pageGrant: 5, iconClass: 'icon-options', styleClass: '', label: 'Reselect the group' },     // appeared only one of these 'pageGrant: 5'
    ];

    this.state = {
      pageGrant: this.props.pageGrant || 1,  // default: 1
      pageGrantGroup: this.props.pageGrantGroup,
      isSelectGroupModalShown: false,
    };

    this.showSelectGroupModal = this.showSelectGroupModal.bind(this);
    this.hideSelectGroupModal = this.hideSelectGroupModal.bind(this);

    this.getGroupName = this.getGroupName.bind(this);

    this.changeGrantHandler = this.changeGrantHandler.bind(this);
    this.groupListItemClickHandler = this.groupListItemClickHandler.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // refresh bootstrap-select
    // see https://silviomoreto.github.io/bootstrap-select/methods/#selectpickerrefresh
    $('.page-grant-selector.selectpicker').selectpicker('refresh');

    //// DIRTY HACK -- 2018.05.25 Yuki Takei
    // set group name to the bootstrap-select options
    //  cz: .selectpicker('refresh') doesn't replace data-content
    $('.page-grant-selector .group-name').text(this.getGroupName());
  }

  showSelectGroupModal() {
    this.setState({ isSelectGroupModalShown: true });
  }
  hideSelectGroupModal() {
    this.setState({ isSelectGroupModalShown: false });
  }

  getGroupName() {
    const pageGrantGroup = this.state.pageGrantGroup;
    return pageGrantGroup ? pageGrantGroup.name : '';
  }

  /**
   * change event handler for pageGrant selector
   */
  changeGrantHandler() {
    const pageGrant = +this.grantSelectorInputEl.value;

    // select group
    if (pageGrant === 5) {
      this.showSelectGroupModal();
      /*
       * reset grant selector to state
       */
      this.grantSelectorInputEl.value = this.state.pageGrant;
      return;
    }

    this.setState({ pageGrant, pageGrantGroup: null });
    // dispatch event
    this.dispatchOnChangePageGrant(pageGrant);
    this.dispatchOnDeterminePageGrantGroup(null);
  }

  groupListItemClickHandler(pageGrantGroup) {
    this.setState({ pageGrant: 5, pageGrantGroup });

    // dispatch event
    this.dispatchOnChangePageGrant(5);
    this.dispatchOnDeterminePageGrantGroup(pageGrantGroup._id);

    // hide modal
    this.hideSelectGroupModal();
  }

  dispatchOnChangePageGrant(pageGrant) {
    if (this.props.onChangePageGrant != null) {
      this.props.onChangePageGrant(pageGrant);
    }
  }

  dispatchOnDeterminePageGrantGroup(pageGrantGroup) {
    if (this.props.onDeterminePageGrantGroupId != null) {
      this.props.onDeterminePageGrantGroupId(pageGrantGroup);
    }
  }

  /**
   * Render grant selector DOM.
   * @returns
   * @memberof GrantSelector
   */
  renderGrantSelector() {
    const { t } = this.props;

    let index = 0;
    let selectedValue = this.state.pageGrant;
    const grantElems = this.availableGrants.map((grant) => {
      const dataContent = `<i class="icon icon-fw ${grant.iconClass} ${grant.styleClass}"></i> <span class="${grant.styleClass}">${t(grant.label)}</span>`;
      return <option key={index++} value={grant.pageGrant} data-content={dataContent}>{t(grant.label)}</option>;
    });

    const pageGrantGroup = this.state.pageGrantGroup;
    if (pageGrantGroup != null) {
      selectedValue = SPECIFIED_GROUP_VALUE;
      /*
       * set SPECIFIED_GROUP_VALUE to grant selector
       *  cz: bootstrap-select input element has the defferent state to React component
       */
      this.grantSelectorInputEl.value = SPECIFIED_GROUP_VALUE;

      // DIRTY HACK -- 2018.05.25 Yuki Takei
      // remove 'Only inside the group' item
      //  cz: .selectpicker('refresh') doesn't replace data-content
      grantElems.splice(3, 1);
    }
    else {
      // DIRTY HACK -- 2018.05.25 Yuki Takei
      // remove 'Reselect the group' item
      //  cz: .selectpicker('refresh') doesn't replace data-content
      grantElems.splice(4, 1);
    }

    // add specified group option
    grantElems.push(
      <option ref="specifiedGroupOption" key="specifiedGroupKey" value={SPECIFIED_GROUP_VALUE} style={{ display: pageGrantGroup ? 'inherit' : 'none' }}
          data-content={`<i class="icon icon-fw icon-organization text-success"></i> <span class="group-name text-success">${this.getGroupName()}</span>`}>
        {this.getGroupName()}
      </option>
    );

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width
    return (
      <FormGroup className="m-b-0">
        <FormControl componentClass="select" placeholder="select" defaultValue={selectedValue} bsClass={bsClassName} className="btn-group-sm page-grant-selector selectpicker"
          onChange={this.changeGrantHandler}
          inputRef={ el => this.grantSelectorInputEl=el }>

          {grantElems}

        </FormControl>
      </FormGroup>
    );
  }

  /**
   * Render select grantgroup modal.
   *
   * @returns
   * @memberof GrantSelector
   */
  renderSelectGroupModal() {
    // TODO fetch from API
    const userRelatedGroups = [
      { _id: 1, name: 'hoge' },
      { _id: 2, name: 'fuga' },
      { _id: 3, name: 'foo' },
    ];

    const groupListItems = userRelatedGroups.map((group) => {
      return <ListGroupItem key={group._id} header={group.name} onClick={() => { this.groupListItemClickHandler(group) }}>
          (TBD) List group members
        </ListGroupItem>;
    });
    return (
        <Modal className="select-grant-group"
          container={this} show={this.state.isSelectGroupModalShown} onHide={this.hideSelectGroupModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Select a Group
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>
              {groupListItems}
            </ListGroup>
          </Modal.Body>
        </Modal>
    );
  }

  render() {
    return <React.Fragment>
      <div className="m-r-5">{this.renderGrantSelector()}</div>
      {this.renderSelectGroupModal()}
    </React.Fragment>;
  }
}

GrantSelector.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  isGroupModalShown: PropTypes.bool,
  pageGrant: PropTypes.number,
  pageGrantGroup: PropTypes.object,
  onChangePageGrant: PropTypes.func,
  onDeterminePageGrantGroupId: PropTypes.func,
};

export default translate()(GrantSelector);
