const { Schema, model } = require("mongoose");

const Msg = new Schema({
    message: String,
}, {
  //设置时间戳
  timestamps: {
    createdAt: 'createTime',
    updatedAt:'updateTime'
  }
});

module.exports = model("Msg", Msg);