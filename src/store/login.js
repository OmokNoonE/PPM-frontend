const state = {
    needLogin: true,
    employeeId: "",
    employeeName: "",
    accessToken: localStorage.getItem("accessToken") || null,
    projectId: "",
    projectTitle: "",
    projectMemberId: "",
    roleId: ""
};

const mutations = {
    needLogin(state, data) {
        state.needLogin = data;
    },
    employeeId(state, data) {
        state.employeeId = data;
    },
    employeeName(state, data) {
        state.employeeName = data;
    },
    accessToken(state, data) {
        state.accessToken = data;
        localStorage.setItem('accessToken', data);
    },
    projectId: (state, data) => {
        state.projectId = data;
    },
    projectTitle: (state, data) => {
        state.projectTitle = data;
    },
    projectMemberId: (state, data) => {
        state.projectMemberId = data;
    },
    roleId: (state, data) => {
        state.roleId = data;
    }
};

const actions = {
    resetLogin({commit}) {
        commit("needLogin", true);
        commit("employeeId", "");
        commit("employeeName", "");
        commit("accessToken", "");
        commit("projectId", "");
        commit("projectTitle", "");
        commit("projectMemberId", "");
        commit("roleId", "");
    }
};

const getters = {
    needLogin(state) {
        return state.needLogin;
    },
    employeeId(state) {
        return state.employeeId;
    },
    employeeName(state) {
        return state.employeeName;
    },
    accessToken(state) {
        return state.accessToken;
    },
    projectId: (state) => {
        return state.projectId;
    },
    projectTitle: (state) => {
        return state.projectTitle;
    },
    projectMemberId: (state) => {
        return state.projectMemberId;
    },
    roleId: (state) => {
        return state.roleId;
    },
};

export default {
    state,
    mutations,
    actions,
    getters
};
