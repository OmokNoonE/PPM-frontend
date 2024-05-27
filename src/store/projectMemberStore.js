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
        SET_PROJECT_MEMBERS(state, projectMembers) {
            state.projectMembers = projectMembers;
        },
        SET_AVAILABLE_MEMBERS(state, availableMembers) {
            state.availableMembers = availableMembers;
        },
        ADD_PROJECT_MEMBER(state, projectMember) {
            state.projectMembers.push(projectMember);
        },
        REMOVE_PROJECT_MEMBER(state, projectMemberId) {
            const projectMember = state.projectMembers.find((m) => m.projectMemberId === projectMemberId);
            if (projectMember) {
                projectMember.isDeleted = true;
            }
        },
        UPDATE_PROJECT_MEMBER_ROLE(state, {projectMemberId, role}) {
            const projectMember = state.projectMembers.find((m) => m.projectMemberId === projectMemberId);
            if (projectMember) {
                projectMember.role = role;
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
        SET_SEARCH_RESULTS(state, searchResults) {
            state.searchResults = searchResults;
        },
    },
    actions: {
        async fetchProjects({commit}) {
            try {
                const response = await axios.get('/projects');
                commit('SET_PROJECTS', response.data);
            } catch (err) {
                console.error('프로젝트 목록을 가져오는 중 오류 발생:', err);
            }
        },
        async fetchProjectMembers({commit, state}) {
            commit('SET_PROJECT_MEMBERS_LOADING', true);
            try {
                const response = await axios.get(`/projectMembers/list/${state.selectedProjectId}`);
                commit('SET_PROJECT_MEMBERS', response.data.viewProjectMembersByProject);
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
                const response = await axios.get(`/projectMembers/availableMembers/${state.selectedProjectId}`, {
                    params: {query}
                });
                commit('SET_SEARCH_RESULTS', response.data.viewAvailableMembers);
            } catch (err) {
                console.error('구성원 목록을 가져오는 중 오류 발생:', err);
            } finally {
                commit('SET_AVAILABLE_MEMBERS_LOADING', false);
            }
        },
        async addProjectMember({commit, state}, {employeeId, role}) {
            try {
                const response = await axios.post('/projectMembers/create', {
                    employeeId: employeeId,
                    projectId: state.selectedProjectId,
                    role: role,
                });
                commit('ADD_PROJECT_MEMBER', response.data.createProjectMember);
            } catch (err) {
                console.error('프로젝트 구성원을 추가하는 중 오류 발생:', err);
                throw new Error('프로젝트 구성원을 추가하는 중 오류가 발생했습니다.');
            }
        },
        async removeProjectMember({commit, state}, projectMemberId) {
            try {
                await axios.put(`/projectMembers/remove/${projectMemberId}`, {
                    projectId: state.selectedProjectId,
                });
                commit('REMOVE_PROJECT_MEMBER', projectMemberId);
            } catch (err) {
                console.error('프로젝트 구성원을 제외하는 중 오류 발생:', err);
                throw new Error('프로젝트 구성원을 제외하는 중 오류가 발생했습니다.');
            }
        },
        async modifyProjectMember({commit, state}, {projectMemberId, role}) {
            try {
                await axios.put(`/projectMembers/modify/${projectMemberId}`, {
                    role: role,
                    projectId: state.selectedProjectId,
                });
                commit('UPDATE_PROJECT_MEMBER_ROLE', {projectMemberId, role});
            } catch (err) {
                console.error('프로젝트 구성원 직책을 업데이트하는 중 오류 발생:', err);
                throw new Error('프로젝트 구성원 직책을 업데이트하는 중 오류가 발생했습니다.');
            }
        },
        selectProject({commit, dispatch}, projectId) {
            commit('SET_SELECTED_PROJECT_ID', projectId);
            dispatch('fetchProjectMembers');
            dispatch('fetchAvailableMembers', {query: ''});
        },
    },
    getters: {
        filteredProjectMembers(state) {
            return state.projectMembers.filter((projectMember) => !projectMember.isDeleted);
        },
        searchResults(state) {
            return state.searchResults;
        },
        selectedProjectId: (state) => state.selectedProjectId,
    },
});
