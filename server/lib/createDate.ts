import moment from 'moment';

moment.locale('ru')

export const createDate = () => moment().format('LLLL');