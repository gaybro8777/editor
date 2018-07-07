import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import CommentFormatter from 'formatters/commentFormatter.js';

const styles = theme => ({
    main: {
        whiteSpace: 'normal',
    },
    nameLabel: {
        flexWrap: 'nowrap',
    },
    expandIcon: {
        marginLeft: theme.spacing.unit,
    }
});

class VariableNameLabelWhereClauseFormatter extends React.Component {
    render() {
        const {classes} = this.props;
        const name = this.props.value.name || '';
        let label;
        if (this.props.value.descriptions.length >= 1) {
            label = this.props.value.descriptions[0].value || '';
        } else {
            label = '';
        }
        const hasVlm = this.props.hasVlm;
        const state = this.props.state;
        const isVlm = this.props.value.whereClause !== undefined;

        let whereClauseLine;
        let comment;
        if (isVlm) {
            whereClauseLine = this.props.value.whereClause.toString(this.props.mdv);
            if (this.props.value.whereClause.commentOid !== undefined) {
                comment = this.props.mdv.comments[this.props.value.whereClause.commentOid];
            }
        }

        let nameLabel;
        if (label.length > 0) {
            nameLabel = name + ' (' + label + ')';
        } else {
            nameLabel = name;
        }


        return (
            <Grid container spacing={8} justify='space-between' alignItems='flex-end' className={classes.main}>
                <Grid container justify='space-between' className={classes.nameLabel}>
                    <Grid item>
                        {nameLabel}
                    </Grid>
                    {hasVlm &&
                            <Grid item>
                                <Button
                                    variant='fab'
                                    mini
                                    color='default'
                                    onClick={this.props.toggleVlmRow(this.props.itemOid)}
                                    className={classes.expandIcon}
                                >
                                    {state === 'collaps' ? <ExpandMoreIcon/> : <ExpandLessIcon/>}
                                </Button>

                            </Grid>
                    }
                </Grid>
                {isVlm &&
                        <Grid item xs={12}>
                            {whereClauseLine}
                        </Grid>
                }
                {comment !== undefined &&
                        <Grid item xs={12}>
                            <CommentFormatter comment={comment} leafs={this.props.mdv.leafs}/>
                        </Grid>
                }
            </Grid>
        );
    }
}

VariableNameLabelWhereClauseFormatter.propTypes = {
    classes       : PropTypes.object.isRequired,
    value         : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    itemOid       : PropTypes.string,
    state         : PropTypes.string,
    hasVlm        : PropTypes.bool,
    mdv           : PropTypes.object,
    toggleVlmRow  : PropTypes.func,
};

export default withStyles(styles)(VariableNameLabelWhereClauseFormatter);

