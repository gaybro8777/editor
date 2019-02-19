/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import withWidth from '@material-ui/core/withWidth';
import NavigationBar from 'core/navigationBar.js';
import StudyTile from 'core/studyTile.js';
import { Study } from 'core/mainStructure.js';
import AddDefineForm from 'core/addDefineForm.js';
import getOid from 'utils/getOid.js';
import { addStudy } from 'actions/index.js';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: theme.palette.grey[50],
        minHeight: 'calc(100vh -  ' + (theme.spacing.unit * 7).toString() + 'px)',
        marginTop: theme.spacing.unit * 7
    },
    gridList: {
        width: '100%'
    },
    gridTile: {
        width: 100
    }
});

const mapStateToProps = state => {
    return {
        studies: state.present.studies,
        defines: state.present.defines,
        currentDefineId: state.present.ui.main.currentDefineId,
        isCurrentDefineSaved: state.present.ui.main.isCurrentDefineSaved,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addStudy: updateObj => dispatch(addStudy(updateObj))
    };
};

const widthCols = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 7
};

class ConnectedStudies extends React.Component {
  addStudy = () => {
      let id = getOid('Study', undefined, this.props.studies.allIds);
      let name = 'Study ' + (this.props.studies.allIds.length + 1).toString();
      let study = new Study({ id, name });
      this.props.addStudy({ study: { ...study } });
  };

  getStudies = asses => {
      let studies = this.props.studies.byId;
      return Object.keys(studies).map(studyId => {
          let study = studies[studyId];
          return (
              <GridListTile key={study.id} className={this.props.classes.gridTile}>
                  <StudyTile
                      study={study}
                      defines={this.props.defines}
                      currentDefineId={this.props.currentDefineId}
                      isCurrentDefineSaved={this.props.isCurrentDefineSaved}
                  />
              </GridListTile>
          );
      });
  };

  render () {
      const { classes, width } = this.props;
      let studyNum = Object.keys(this.props.studies.byId).length;
      let subHeaderText;
      if (studyNum === 0) {
          subHeaderText = 'No Studies';
      } else if (studyNum === 1) {
          subHeaderText = '1 Study';
      } else {
          subHeaderText = studyNum.toString() + ' Studies';
      }

      let cols = widthCols[width];

      return (
          <React.Fragment>
              <NavigationBar>
                  <Button size="small" variant="contained" onClick={this.addStudy}>
            New Study
                  </Button>
              </NavigationBar>
              <div className={classes.root}>
                  <GridList
                      cellHeight={200}
                      className={classes.gridList}
                      cols={cols}
                      spacing={8}
                  >
                      <GridListTile
                          key="subheader"
                          style={{ height: '60px', textAlign: 'center' }}
                          cols={cols}
                      >
                          <ListSubheader component="div">{subHeaderText}</ListSubheader>
                      </GridListTile>
                      {this.getStudies()}
                  </GridList>
              </div>
              <AddDefineForm />
          </React.Fragment>
      );
  }
}

ConnectedStudies.propTypes = {
    classes: PropTypes.object.isRequired,
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    width: PropTypes.string.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    addStudy: PropTypes.func.isRequired
};

const Studies = connect(mapStateToProps, mapDispatchToProps)(ConnectedStudies);
export default withWidth()(withStyles(styles)(Studies));
