let statsMess: { login: string, count: number }[] = [];

const addStat = (login: string, count: number): void => {
  if (!statsMess.find(user => user.login === login)) {
    statsMess.push({ login, count });
  } else {
    const oldCount = statsMess.find(user => user.login === login)?.count ?? 0;
    statsMess = statsMess.map(user => user.login === login ? { login, count: count + oldCount } : user);
  }
};

const clearStat = (login: string): void => {
  statsMess = statsMess.filter(user => user.login !== login);
}

const getStats = () => statsMess;

export const CharsStats = {
  addStat,
  clearStat,
  getStats,
};
