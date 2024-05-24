import { createStore } from 'vuex';
import axios from 'axios';

export const store = createStore({
    state: {
        projectMembers: [], // 프로젝트 구성원 목록
        availableMembers: [], // 프로젝트에 추가되지 않은 회원 목록
        projectId: null, // 현재 프로젝트 ID
    },
    mutations: {
        SET_PROJECT_MEMBERS(state, members) {
            state.projectMembers = members;
        },
        SET_AVAILABLE_MEMBERS(state, members) {
            state.availableMembers = members;
        },
        ADD_PROJECT_MEMBER(state, member) {
            state.projectMembers.push(member);
        },
        REMOVE_PROJECT_MEMBER(state, memberId) {
            const member = state.projectMembers.find((m) => m.id === memberId);
            if (member) {
                member.isDeleted = true;
            }
        },
        SET_PROJECT_ID(state, projectId) {
            state.projectId = projectId;
        },
    },
    actions: {
        async fetchProjectMembers({ commit, state }) {
            try {
                const response = await axios.get(`/api/project-members?projectId=${state.projectId}`);
                commit('SET_PROJECT_MEMBERS', response.data);
            } catch (err) {
                console.error('프로젝트 구성원을 가져오는 중 오류 발생:', err);
            }
        },
        async fetchAvailableMembers({ commit, state }) {
            try {
                const response = await axios.get(`/api/available-members?projectId=${state.projectId}`);
                commit('SET_AVAILABLE_MEMBERS', response.data);
            } catch (err) {
                console.error('추가 가능한 회원 목록을 가져오는 중 오류 발생:', err);
            }
        },
        async addProjectMember({ commit, state }, { memberId, role }) {
            try {
                const response = await axios.post('/api/project-members', {
                    employeeId: memberId,
                    projectId: state.projectId,
                    role: role,
                });
                commit('ADD_PROJECT_MEMBER', response.data);
            } catch (err) {
                console.error('프로젝트 구성원을 추가하는 중 오류 발생:', err);
            }
        },
        async removeProjectMember({ commit, state }, memberId) {
            try {
                await axios.put(`/api/project-members/${memberId}`, {
                    projectId: state.projectId,
                });
                commit('REMOVE_PROJECT_MEMBER', memberId);
            } catch (err) {
                console.error('프로젝트 구성원을 제외하는 중 오류 발생:', err);
            }
        },
    },
    getters: {
        filteredProjectMembers(state) {
            return state.projectMembers.filter((member) => !member.isDeleted);
        },
        filteredAvailableMembers(state) {
            return state.availableMembers.filter((member) => !member.isDeleted);
        },
    },
});