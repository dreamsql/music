import DataBase from '@/vendor/database';
import { LocalStore as Store  } from '@/vendor/store';
// 获取shopId和openid
const music_user = Store.get('music_user');
const shopId = music_user && music_user.shopId;
const openId = music_user && music_user.openId;
const qrcodeId = music_user && music_user.qrcodeId;
// 存储评论
// boardMsg 评论内容
// isReply 是否回复的评论
// replayTo 被回复者的id
const saveBoard = (boardMsg, isReply, replayTo) => {
    let msgContent;
    // boardlist对象（leancloud）
    const Board = DataBase.Object.extend('board_list');
    const board = new Board();
    const shop = DataBase.Object.createWithoutData('shop', shopId);
    board.set('shop', shop);
    board.set('commentFrom', openId);
    // 如果是回复的评论
    if (isReply) {
      msgContent = boardMsg.slice(replayTo.length + 3);
      board.set('to', DataBase.Object.createWithoutData('board_list', this.to));
    } else {
      msgContent = boardMsg;
      board.set('to', null);
    }
    board.set('comment', msgContent);  
    return board.save();
}
// 存储播放列表
// option 歌曲信息
// beforecb 存储之前的回调
const savePlayList = (option, beforecb) => {
    // 播放列表对象（leancloud）
    const Playlist = DataBase.Object.extend('playlist');
    const playlist = new Playlist();
    // 创建shop和qrcode对象（leancloud）
    const shop = DataBase.Object.createWithoutData('shop', shopId);
    const qrcode = DataBase.Object.createWithoutData('qrcode', qrcodeId);
    let { music, status, top} = option;
    playlist.set(music);
    playlist.set('status', status);
    playlist.set('openId', openId);
    playlist.set('shop', shop);
    playlist.set('qrcode', qrcode);
    playlist.set('top', top);
    beforecb && beforecb();
    return playlist.save();
}
// 存储留言
const saveBoardList = (option, beforecb) => {
    const Board = DataBase.Object.extend('board_list');
    const board = new Board();
    let { toId, comment, shop } = option;
    board.set('shop', shop);
    board.set('commentFrom', '商家');
    board.set('to', DataBase.Object.createWithoutData('board_list', toId));
    board.set('comment', comment);  
    beforecb && beforecb();
    return board.save();
}
export {
    saveBoard,
    savePlayList,
    saveBoardList
}