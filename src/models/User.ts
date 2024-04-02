import { DataTypes } from 'sequelize';
import sequelize from '@database/index';

// 定义用户模型
const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  
  // 同步模型与数据库
  await User.sync();