export const createDate = () => {
    const date = new Date();
    return (
                ((date.getUTCHours() + 5).toString().length === 1 ? ('0' + (date.getUTCHours() + 5)) : (date.getUTCHours() + 5)) + ':' + 
                (date.getMinutes().toString().length === 1 ? ('0' + date.getMinutes()) : date.getMinutes()) + ':' + 
                (date.getSeconds().toString().length === 1 ? ('0' + date.getSeconds()) : date.getSeconds()) + ' ' + 
                (date.getDate().toString().length === 1 ? ('0' + date.getDate()) : date.getDate()) + '.' + 
                ((date.getMonth() + 1).toString().length === 1 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)) + '.' + 
                date.getFullYear()
            );
}