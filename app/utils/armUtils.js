/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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

import getOid from 'utils/getOid.js';
import clone from 'clone';
import { copyComment } from 'utils/copyVariables.js';
import { WhereClause } from 'core/defineStructure.js';
import { AnalysisResult, ResultDisplay } from 'core/armStructure.js';

const copyAnalysisResults = ({
    mdv,
    sourceMdv,
    analysisResultOidList,
    sameDefine,
    existingOids = {
        itemDefs: [],
        methods: [],
        comments: [],
        codeLists: [],
        whereClauses: [],
        valueLists: [],
        analysisResults: [],
        resultDisplays: [],
    },
} = {}) => {
    let rawAnalysisResults = mdv.analysisResultDisplays.analysisResults;
    let sourceAnalysisResults = sourceMdv.analysisResultDisplays.analysisResults;
    let analysisResults = {};
    let whereClauses = {};
    let currentAnalysisResults = Object.keys(rawAnalysisResults).concat(existingOids.analysisResults);
    let currentWhereClauses = Object.keys(mdv.whereClauses).concat(existingOids.whereClauses);
    analysisResultOidList.forEach( analysisResultOid => {
        let analysisResult = clone(sourceAnalysisResults[analysisResultOid]);
        let newAnalysisResultOid = getOid('AnalysisResult', undefined, currentAnalysisResults);
        // Copy Analysis Datasets data
        let itemRefList = {};
        Object.values(analysisResult.analysisDatasets).forEach( analysisDataset => {
            // Check if datasets/variables should be copied
            if (sameDefine) {
                // In case of the same Define there is no need to copy anything
                if (analysisDataset.whereClauseOid !== undefined && sourceMdv.itemGroups.hasOwnProperty(analysisDataset.itemGroupOid)) {
                    let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                    let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                    currentWhereClauses.push(newWhereClauseOid);
                    whereClauses[newWhereClauseOid] = { ...new WhereClause({
                        ...whereClause,
                        oid: newWhereClauseOid,
                        sources: { analysisResults: {[newAnalysisResultOid]: [analysisDataset.itemGroupOid]} }
                    }) };
                    analysisDataset.whereClauseOid = newWhereClauseOid;
                }
            } else {
                // Check if the target MDV has a dataset with the same name
                let sourceName = sourceMdv.itemGroups[analysisDataset.itemGroupOid].name;
                let sameDatasetOid;
                const sameDatasetExists = Object.values(mdv.itemGroups).some( itemGroup => {
                    if (itemGroup.name === sourceName) {
                        sameDatasetOid = itemGroup.oid;
                        return true;
                    }
                });

                // Find which variables need to be copied
                let sourceItemRefList = [];
                if (sameDatasetExists) {
                    let sameDataset = mdv.itemGroups[sameDatasetOid];
                    analysisDataset.analysisVariableOids.forEach( itemOid => {
                        let variableName = sourceMdv.itemDefs[itemOid].name;
                        let sameVariableExists = Object.keys(sameDataset.itemRefs).some( itemRefOid => {
                            if (mdv.itemDefs[sameDataset.itemRefs[itemRefOid].itemOid].name === variableName) {
                                return true;
                            }
                        });
                        // If the same variable does not exist in the current MDV, add corresponding ItemRefOid to the list
                        if (!sameVariableExists) {
                            let sourceItemRefs = sourceMdv.itemGroups[analysisDataset.itemGroupOid].itemRefs;
                            Object.keys(sourceItemRefs).some(itemRefOid => {
                                if (sourceItemRefs[itemRefOid].itemOid === itemOid) {
                                    sourceItemRefList.push(itemRefOid);
                                    return true;
                                }
                            });
                        }
                    });
                } else {
                    analysisDataset.analysisVariableOids.forEach( itemOid => {
                        let sourceItemRefs = sourceMdv.itemGroups[analysisDataset.itemGroupOid].itemRefs;
                        Object.keys(sourceItemRefs).some(itemRefOid => {
                            if (sourceItemRefs[itemRefOid].itemOid === itemOid) {
                                sourceItemRefList.push(itemRefOid);
                                return true;
                            }
                        });
                    });
                }
                itemRefList[analysisDataset.itemGroupOid] = sourceMdv.itemGroups[analysisDataset.itemGroupOid].itemRefs;

                // Copy where clause and variables from it.
                // In case of the same Define there is no need to copy anything
                // TODO: Copy where clause
                if (analysisDataset.whereClauseOid !== undefined && sourceMdv.itemGroups.hasOwnProperty(analysisDataset.itemGroupOid)) {
                    let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                    let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                    currentWhereClauses.push(newWhereClauseOid);
                    whereClauses[newWhereClauseOid] = { ...new WhereClause({
                        ...whereClause,
                        oid: newWhereClauseOid,
                        sources: { analysisResults: {[newAnalysisResultOid]: [analysisDataset.itemGroupOid]} }
                    }) };
                    analysisDataset.whereClauseOid = newWhereClauseOid;
                }
            }
            // Copy ItemGroups
            // TODO: Need to distinguish situations when the same datasets exists and only some vairables are copied vs dataset is copied
            /*
            const { itemGroups, itemGroupComments } = copyItemGroups({
                mdv,
                sourceMdv,
                sameDefine,
                itemRefList,
                purpose: this.state.purpose,
                itemGroupList: this.state.selected,
            });
            */
        });
        // Create new analysis results
        analysisResults[newAnalysisResultOid] = { ...new AnalysisResult({
            ...analysisResult,
            oid: newAnalysisResultOid,
        }) };
        currentAnalysisResults.push(newAnalysisResultOid);
    });
    // Copy comments;
    let comments = {};
    // Analysis Result Dataset comments
    Object.keys(analysisResults).forEach( analysisResultOid => {
        let analysisResult = analysisResults[analysisResultOid];
        if (analysisResult.analysisDatasetsCommentOid !== undefined) {
            let { newCommentOid, comment } = copyComment({
                sourceCommentOid: analysisResult.analysisDatasetsCommentOid,
                mdv: mdv,
                sourceMdv: sourceMdv,
                searchForDuplicate: false,
                analysisResultOid,
                existingOids,
            });
            analysisResult.analysisDatasetsCommentOid = newCommentOid;
            comments[newCommentOid] = comment;
        }
    });
    // Where Clause Comments
    Object.keys(whereClauses).forEach( whereClauseOid => {
        let whereClause = whereClauses[whereClauseOid];
        if (whereClause.commentOid !== undefined) {
            let { newCommentOid, comment, duplicateFound } = copyComment({
                sourceCommentOid: whereClause.commentOid,
                mdv: mdv,
                sourceMdv: sourceMdv,
                searchForDuplicate: false,
                whereClauseOid,
                existingOids,
            });
            whereClause.commentOid = newCommentOid;
            if (!duplicateFound) {
                comments[newCommentOid] = comment;
            }
        }
    });
    return { analysisResults, whereClauses, comments };
};

const copyResultDisplays = ({
    mdv,
    sourceMdv,
    resultDisplayOidList,
    sameDefine,
    existingOids = {
        itemDefs: [],
        methods: [],
        comments: [],
        codeLists: [],
        whereClauses: [],
        valueLists: [],
        analysisResults: [],
        resultDisplays: [],
    },
} = {}) => {
    let rawResultDisplays = mdv.analysisResultDisplays.resultDisplays;
    let sourceResultDisplays = sourceMdv.analysisResultDisplays.resultDisplays;
    let resultDisplays = {};
    let comments = {};
    let analysisResults = {};
    let whereClauses = {};
    let currentResultDisplays = Object.keys(rawResultDisplays).concat(existingOids.resultDisplays);
    let currentExistingOids = clone(existingOids);
    resultDisplayOidList.forEach( resultDisplayOid => {
        let resultDisplay = clone(sourceResultDisplays[resultDisplayOid]);
        let newResultDisplayOid = getOid('ResultDisplay', undefined, currentResultDisplays);
        let copiedAnalysisResults = copyAnalysisResults({
            mdv,
            sourceMdv,
            analysisResultOidList: resultDisplay.analysisResultOrder,
            sameDefine,
            existingOids: currentExistingOids,
        });
        resultDisplays[newResultDisplayOid] = { ...new ResultDisplay({
            ...resultDisplay,
            oid: newResultDisplayOid,
            analysisResultOrder: Object.keys(copiedAnalysisResults.analysisResults),
        }) };
        currentResultDisplays.push(newResultDisplayOid);
        comments = { ...comments, ...copiedAnalysisResults.comments };
        analysisResults = { ...analysisResults, ...copiedAnalysisResults.analysisResults };
        whereClauses = { ...whereClauses, ...copiedAnalysisResults.whereClauses };
        currentExistingOids.comments = currentExistingOids.comments.slice().concat(Object.keys(comments));
        currentExistingOids.whereClauses = currentExistingOids.whereClauses.slice().concat(Object.keys(whereClauses));
        currentExistingOids.analysisResults = currentExistingOids.analysisResults.slice().concat(Object.keys(analysisResults));
    });
    return { resultDisplays, analysisResults, whereClauses, comments };
};

export default  { copyAnalysisResults, copyResultDisplays };
