import React from 'react';
import PropTypes from 'prop-types';
import EditorTabs from 'tabs/editorTabs.js';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import parseDefine from 'parsers/parseDefine.js';
import { withStyles } from 'material-ui/styles';
import parseStdCodeLists from 'parsers/parseStdCodeLists.js';
import { connect } from 'react-redux';
import { CircularProgress } from 'material-ui/Progress';
import {
    addOdm,
    addStdControlledTerminology,
    addStdConstants,
    updateCodeListStandardOids,
} from 'actions/index.js';
const {ipcRenderer} = window.require('electron');

const styles = theme => ({
    root: {
        flexGrow        : 1,
        marginTop       : theme.spacing.unit * 3,
        backgroundColor : theme.palette.background.paper,
    },
    progress: {
        margin: theme.spacing.unit * 2,
    },
    loading: {
        position  : 'absolute',
        top       : '47%',
        left      : '47%',
        transform : 'translate(-47%, -47%)',
        textAlign : 'center',
    }
});

const mapDispatchToProps = dispatch => {
    return {
        addOdm                      : odm => dispatch(addOdm(odm)),
        addStdControlledTerminology : codeListsOdm => dispatch(addStdControlledTerminology(codeListsOdm)),
        addStdConstants             : () => dispatch(addStdConstants()),
        updateCodeListStandardOids  : (updateObj) => dispatch(updateCodeListStandardOids(updateObj)),
    };
};

const mapStateToProps = state => {
    let odmLoaded = false;
    if (state.odm !== undefined && state.odm.odmVersion !== undefined) {
        odmLoaded = true;
    }
    return {
        odmLoaded,
        codeLists: odmLoaded ? state.odm.study.metaDataVersion.codeLists : undefined,
    };
};

class ConnectedEditor extends React.Component {
    componentDidMount() {
        ipcRenderer.on('define', this.loadDefine);
        ipcRenderer.on('stdCodeLists', this.loadStdCodeLists);
        this.props.addStdConstants();
    }

    componentWillUnmount() {
        ipcRenderer.removeListener('define', this.loadDefine);
        ipcRenderer.removeListener('stdCodeLists', this.loadStdCodeLists);
    }

    loadDefine = (error, data) => {

        let odm = parseDefine(data);
        // Testing
        // Keep only 1 ds for testing
        /*
    Object.keys(odm.study.metaDataVersion.itemGroups).forEach( (item,index) => {
        if (index !== 1) {
            delete odm.study.metaDataVersion.itemGroups[item];
        }
    });
    */
        /*
        let mdv = odm.study.metaDataVersion;
        Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs).forEach( (item,index) => {
            let ds = odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'];
            let itemRef = odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs[item];
            if (5 < index && index < 39 && mdv.itemDefs[itemRef.itemOid].name !== 'AVAL' && mdv.itemDefs[itemRef.itemOid].name !== 'PARAMCD') {
                delete ds.itemRefs[item];
                if ( ds.keyOrder.includes(item) ) {
                    ds.keyOrder.splice(ds.keyOrder.indexOf(item), 1);
                }
                if ( ds.itemRefOrder.includes(item) ) {
                    ds.itemRefOrder.splice(ds.itemRefOrder.indexOf(item), 1);
                }
            }
        });

        Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs).forEach( (item,index) => {
            let ds = odm.study.metaDataVersion.itemGroups['IG.ADSL'];
            if (index > 5) {
                delete odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs[item];
                if ( ds.keyOrder.includes(item) ) {
                    ds.keyOrder.splice(ds.keyOrder.indexOf(item), 1);
                }
                if ( ds.itemRefOrder.includes(item) ) {
                    ds.itemRefOrder.splice(ds.itemRefOrder.indexOf(item), 1);
                }
            }
        });
        */
        this.props.addOdm(odm);
    }

    loadStdCodeLists = (error, data) => {
        let stdCodeListsOdm = parseStdCodeLists(data);

        // Check if any codelist with alias, but without a standard assigned matches the loaded standard
        let codeLists = this.props.codeLists;
        if (codeLists !== undefined) {
            let updateObj = {};
            Object.keys(codeLists).forEach( codeListOid => {
                if (codeLists[codeListOid].alias !== undefined
                    && codeLists[codeListOid].standardOid === undefined
                    && codeLists[codeListOid].alias.context === 'nci:ExtCodeID') {
                    if (Object.keys(stdCodeListsOdm.study.metaDataVersion.nciCodeOids).includes(codeLists[codeListOid].alias.name)) {
                        updateObj[codeListOid] = stdCodeListsOdm.study.oid;
                    }
                }
            });
            // TODO: Check if loaded standard impacts existing codelists
            Promise.resolve(this.props.addStdControlledTerminology(stdCodeListsOdm))
                .then(this.props.updateCodeListStandardOids(updateObj));
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                {this.props.odmLoaded ? (
                    <EditorTabs/>
                ) : (
                    <div className={classes.loading}>
                        Loading Define-XML
                        <br/>
                        <CircularProgress className={classes.progress} />
                    </div>
                )
                }
            </React.Fragment>
        );
    }
}

ConnectedEditor.propTypes = {
    odmLoaded : PropTypes.bool.isRequired,
    classes   : PropTypes.object.isRequired,
    codeLists : PropTypes.object,
};

const Editor = connect(mapStateToProps, mapDispatchToProps)(ConnectedEditor);
export default withStyles(styles)(Editor);
