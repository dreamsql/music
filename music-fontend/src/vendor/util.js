// 判断用户是否超级用户的规则
const isSuper = (user) => {
    if (user && user.role) {
        return user.role == 'admin' || user.role == 'super';
    } else {
        return false;
    }
}

const getQueryStr = (qr, name) => {
    let qrList;
    let result;
    if (qr[0] == '?') {
        qrList = qr.slice(1).split('&');
    } else {
        qrList = qr.split('&');
    }
    qrList.forEach((item) => {
        let key = item.split('=')[0];
        let value = item.split('=')[1];
        if (key == name) {
            result = value;
        }
    })
    return result;
}
export { isSuper, getQueryStr };