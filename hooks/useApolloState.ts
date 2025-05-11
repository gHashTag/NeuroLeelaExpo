import { useReactiveVar, gql, useQuery } from '@apollo/client';
import {
  currentPlayerPositionVar,
  loadingStateVar,
  reportCreationSuccessVar,
  reportFormErrorsVar
} from '@/lib/apollo-client';

// GraphQL запросы для получения реактивных переменных из кэша
const GET_CURRENT_PLAYER_POSITION = gql`
  query GetCurrentPlayerPosition {
    currentPlayerPosition @client
  }
`;

const GET_LOADING_STATE = gql`
  query GetLoadingState {
    loadingState @client
  }
`;

const GET_REPORT_CREATION_SUCCESS = gql`
  query GetReportCreationSuccess {
    reportCreationSuccess @client
  }
`;

const GET_REPORT_FORM_ERRORS = gql`
  query GetReportFormErrors {
    reportFormErrors @client
  }
`;

// Хуки для доступа к реактивным переменным

// Прямой доступ к реактивным переменным (быстрее)
export const useCurrentPlayerPositionDirect = () => {
  return {
    currentPosition: useReactiveVar(currentPlayerPositionVar),
    setCurrentPosition: currentPlayerPositionVar
  };
};

export const useLoadingStateDirect = () => {
  return {
    loading: useReactiveVar(loadingStateVar),
    setLoading: loadingStateVar
  };
};

export const useReportCreationSuccessDirect = () => {
  return {
    success: useReactiveVar(reportCreationSuccessVar),
    setSuccess: reportCreationSuccessVar
  };
};

export const useReportFormErrorsDirect = () => {
  return {
    errors: useReactiveVar(reportFormErrorsVar),
    setErrors: reportFormErrorsVar
  };
};

// Доступ через GraphQL запросы (более последовательный, работает с Apollo DevTools)
export const useCurrentPlayerPosition = () => {
  const { data } = useQuery(GET_CURRENT_PLAYER_POSITION);
  return {
    currentPosition: data?.currentPlayerPosition || 1,
    setCurrentPosition: currentPlayerPositionVar
  };
};

export const useLoadingState = () => {
  const { data } = useQuery(GET_LOADING_STATE);
  return {
    loading: data?.loadingState || true,
    setLoading: loadingStateVar
  };
};

export const useReportCreationSuccess = () => {
  const { data } = useQuery(GET_REPORT_CREATION_SUCCESS);
  return {
    success: data?.reportCreationSuccess || false,
    setSuccess: reportCreationSuccessVar
  };
};

export const useReportFormErrors = () => {
  const { data } = useQuery(GET_REPORT_FORM_ERRORS);
  return {
    errors: data?.reportFormErrors || null,
    setErrors: reportFormErrorsVar
  };
}; 