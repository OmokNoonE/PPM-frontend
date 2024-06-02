// src/store/modules/projectMember.js
import {defaultInstance} from "@/axios/axios-instance";

// 권한 상수 정의
const ROLES = {
    PA: 'PA',
    PL: 'PL',
    PM: 'PM',
};

const state = {
    projectMembers: [], // 프로젝트 구성원 목록
    availableMembers: [], // 프로젝트에 추가되지 않은 회원 목록
    selectedProjectId: null, // 선택된 프로젝트 ID
    projectMembersLoading: false, // 프로젝트 구성원 로딩 상태
    availableMembersLoading: false, // 추가 가능한 구성원 로딩 상태
    searchQuery: '', // 검색어
    searchResults: [], // 검색 결과
};

const mutations = {
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
    UPDATE_PROJECT_MEMBER_ROLE(state, {projectMemberId, role}) {
        const projectMember = state.projectMembers.find((m) => m.projectMemberId === projectMemberId);
        if (projectMember) {
            projectMember.role = role;
        }
    },
    SET_PROJECT_ID(state, projectId) {
        state.projectId = projectId;
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
};

const actions = {
    async fetchProjectMembers({commit, state}) {
        commit('SET_PROJECT_MEMBERS_LOADING', true); // 로딩 상태 설정
        try {
            const response = await defaultInstance.get(`/projectMembers/list/${state.projectId}`);
            commit('SET_PROJECT_MEMBERS', response.data.viewProjectMembersByProject);
        } catch (err) {
            console.error('프로젝트 구성원을 가져오는 중 오류 발생:', err);
            throw new Error('프로젝트 구성원을 가져오는 중 오류가 발생했습니다.');
        } finally {
            commit('SET_PROJECT_MEMBERS_LOADING', false); // 로딩 상태 해제
        }
    },
    async fetchAvailableMembers({commit, state}, {query = ''} = {}) {
        commit('SET_AVAILABLE_MEMBERS_LOADING', true); // 로딩 상태 설정
        commit('SET_SEARCH_QUERY', query); // 검색어 설정
        try {
            const response = await defaultInstance.get(
                `/projectMembers/available/${state.projectId}?query=${query}`);
            commit('SET_SEARCH_RESULTS', response.data.viewAvailableMembers);
        } catch (err) {
            console.error('구성원 목록을 가져오는 중 오류 발생:', err);
            throw new Error('구성원 목록을 가져오는 중 오류가 발생했습니다.');
        } finally {
            commit('SET_AVAILABLE_MEMBERS_LOADING', false); // 로딩 상태 해제
        }
    },
    async addProjectMember({commit, state}, {memberId}) {
        try {
            const response = await defaultInstance.post('/projectMembers/create', {
                projectMemberProjectId: state.projectId,
                projectMemberEmployeeId: memberId,
            });
            commit('ADD_PROJECT_MEMBER', response.data.createProjectMember);
        } catch (err) {
            console.error('프로젝트 구성원을 추가하는 중 오류 발생:', err);
            throw new Error('프로젝트 구성원을 추가하는 중 오류가 발생했습니다.');
        }
    },
    async removeProjectMember({commit}, {memberId, reason}) {
        try {
            await defaultInstance.delete(`/projectMembers/remove/${memberId}`, {
                data: {
                    projectMemberHistoryReason: reason
                }
            });
            commit('REMOVE_PROJECT_MEMBER', memberId);
        } catch (err) {
            console.error('프로젝트 구성원을 제외하는 중 오류 발생:', err);
            throw new Error('프로젝트 구성원을 제외하는 중 오류가 발생했습니다.');
        }
    },
    async modifyProjectMember({commit, state}, {projectMemberId, role}) {
        // 유효한 권한 값인지 확인
        if (!Object.values(ROLES).includes(role)) {
            throw new Error('유효하지 않은 권한 값입니다.');
        }
        try {
            await defaultInstance.put(`/projectMembers/modify/${projectMemberId}`, {
                role: role,
                projectId: state.selectedProjectId,
            });
            commit('UPDATE_PROJECT_MEMBER_ROLE', {projectMemberId, role});
            await this.dispatch('fetchProjectMembers'); // 권한 업데이트 후 최신 데이터 요청
        } catch (err) {
            console.error('프로젝트 구성원 직책을 업데이트하는 중 오류 발생:', err);
            throw new Error('프로젝트 구성원 직책을 업데이트하는 중 오류가 발생했습니다.');
        }
    },
};

const getters = {
    filteredProjectMembers(state) {
        return state.projectMembers.filter((member) => !member.isDeleted); // 삭제되지 않은 구성원 필터링
    },
    searchResults(state) {
        return state.searchResults;
    },
};

export default {
    state,
    mutations,
    actions,
    getters,
};