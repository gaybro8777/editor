import {
    ADD_RESULTDISPLAY,
    ADD_RESULTDISPLAYS,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
    UPD_RESULTDISPLAYORDER,
    ADD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    DEL_ANALYSISRESULT,
    UPD_ANALYSISRESULT,
    UPD_ANALYSISRESULTORDER,
} from "constants/action-types";

// ARM actions
export const updateResultDisplay = (updateObj) => (
    {
        type: UPD_RESULTDISPLAY,
        updateObj,
    }
);

export const addResultDisplay = (updateObj) => (
    {
        type: ADD_RESULTDISPLAY,
        updateObj,
    }
);

export const addResultDisplays = (updateObj) => (
    {
        type: ADD_RESULTDISPLAYS,
        updateObj,
    }
);

export const deleteResultDisplays = (deleteObj) => (
    {
        type: DEL_RESULTDISPLAY,
        deleteObj,
    }
);

export const updateResultDisplayOrder = (updateObj) => (
    {
        type: UPD_RESULTDISPLAYORDER,
        updateObj,
    }
);

export const updateAnalysisResult = (updateObj) => (
    {
        type: UPD_ANALYSISRESULT,
        updateObj,
    }
);

export const addAnalysisResult = (updateObj) => (
    {
        type: ADD_ANALYSISRESULT,
        updateObj,
    }
);

export const addAnalysisResults = (updateObj) => (
    {
        type: ADD_ANALYSISRESULTS,
        updateObj,
    }
);

export const deleteAnalysisResults = (deleteObj) => (
    {
        type: DEL_ANALYSISRESULT,
        deleteObj,
    }
);

export const updateAnalysisResultOrder = (updateObj) => (
    {
        type: UPD_ANALYSISRESULTORDER,
        updateObj,
    }
);
