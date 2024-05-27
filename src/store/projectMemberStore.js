import {createStore} from 'vuex';
import axios from 'axios';

export const store = createStore({
    state: {
        projects: [], // 모든 프로젝트 목록
        projectMembers: [], // 프로젝트 구성원 목록
        availableMembers: [], // 프로젝트에 추가되지 않은 회원 목록
        selectedProjectId: null, // 선택된 프로젝트 ID
        projectMembersLoading: false,
        availableMembersLoading: false,
        searchQuery: '', // 검색어
        searchResults: [], // 검색 결과
    },
    mutations: {
        SET_PROJECTS(state, projects) {
            state.projects = projects;
        },
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
        UPDATE_PROJECT_MEMBER_ROLE(state, {memberId, role}) {
            const member = state.projectMembers.find((m) => m.id === memberId);
            if (member) {
                member.role = role;
            }
        },
        SET_SELECTED_PROJECT_ID(state, projectId) {
            state.selectedProjectId = projectId;
        },
        SET_PROJECT_MEMBERS_LOADING(state, loading) {
            state.projectMembersLoading = loading;
        },
        SET_AVAILABLE_MEMBERS_LOADING(state, loading) {
            state.availableMembersLoading = loading;
        },
        SET_SEARCH_QUERY(state, query) {
            state.searchQuery = query;
        },
        SET_SEARCH_RESULTS(state, results) {
            state.searchResults = results;
        },
    },
    actions: {
        async fetchProjects({commit}) {
            try {
                const response = await axios.get('/api/projects');
                commit('SET_PROJECTS', response.data);
            } catch (err) {
                console.error('프로젝트 목록을 가져오는 중 오류 발생:', err);
            }
        },
        async fetchProjectMembers({commit, state}) {
            commit('SET_PROJECT_MEMBERS_LOADING', true);
            try {
                const response = await axios.get(`/api/projectMembers/project-members?projectId=${state.selectedProjectId}`);
                commit('SET_PROJECT_MEMBERS', response.data);
            } catch (err) {
                console.error('프로젝트 구성원을 가져오는 중 오류 발생:', err);
            } finally {
                commit('SET_PROJECT_MEMBERS_LOADING', false);
            }
        },
        async fetchAvailableMembers({commit, state}, {query = ''} = {}) {
            commit('SET_AVAILABLE_MEMBERS_LOADING', true);
            commit('SET_SEARCH_QUERY', query);
            try {
                const response = await axios.get(`/api/projectMembers/available-members?projectId=${state.selectedProjectId}&query=${query}`);
                commit('SET_SEARCH_RESULTS', response.data);
            } catch (err) {
                console.error('구성원 목록을 가져오는 중 오류 발생:', err);
            } finally {
                commit('SET_AVAILABLE_MEMBERS_LOADING', false);
            }
        },
        async addProjectMember({commit, state}, {memberId, role}) {
            try {
                const response = await axios.post('/api/projectMembers/project-members', {
                    employeeId: memberId,
                    projectId: state.selectedProjectId,
                    role: role,
                });
                commit('ADD_PROJECT_MEMBER', response.data);
            } catch (err) {
                console.error('프로젝트 구성원을 추가하는 중 오류 발생:', err);
                throw new Error('프로젝트 구성원을 추가하는 중 오류가 발생했습니다.');
            }
        },
        async removeProjectMember({commit, state}, memberId) {
            try {
                await axios.put(`/api/projectMembers/project-members/${memberId}`, {
                    projectId: state.selectedProjectId,
                });
                commit('REMOVE_PROJECT_MEMBER', memberId);
            } catch (err) {
                console.error('프로젝트 구성원을 제외하는 중 오류 발생:', err);
                throw new Error('프로젝트 구성원을 제외하는 중 오류가 발생했습니다.');
            }
        },
        async updateProjectMemberRole({commit, state}, {memberId, role}) {
            try {
                await axios.put(`/api/projectMembers/project-members/${memberId}/role`, {
                    role: role,
                    projectId: state.selectedProjectId,
                });
                commit('UPDATE_PROJECT_MEMBER_ROLE', {memberId, role});
            } catch (err) {
                console.error('프로젝트 구성원 직책을 업데이트하는 중 오류 발생:', err);
                throw new Error('프로젝트 구성원 직책을 업데이트하는 중 오류가 발생했습니다.');
            }
        },
        selectProject({commit, dispatch}, projectId) {
            commit('SET_SELECTED_PROJECT_ID', projectId);
            dispatch('fetchProjectMembers');
            dispatch('fetchAvailableMembers');
        },
    },
    getters: {
        filteredProjectMembers(state) {
            return state.projectMembers.filter((member) => !member.isDeleted);
        },
        searchResults(state) {
            return state.searchResults;
        },
        selectedProjectId: (state) => state.selectedProjectId,
    },
});
