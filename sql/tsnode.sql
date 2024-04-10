/*
 Navicat Premium Data Transfer

 Source Server         : 本地数据库
 Source Server Type    : MySQL
 Source Server Version : 80012 (8.0.12)
 Source Host           : localhost:3306
 Source Schema         : tsnode

 Target Server Type    : MySQL
 Target Server Version : 80012 (8.0.12)
 File Encoding         : 65001

 Date: 10/04/2024 17:01:12
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_account` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '3046251309', '3046251309', '3046251309@qq.com', '$2b$10$ci2UCvecSQF7xakRMN.VquTvWp7m7JIqF7T37Tf2t9ARTbjBHCzRy');
INSERT INTO `user` VALUES (2, 'test01', 'test01', '3621353596@qq.com', '$2b$10$ci2UCvecSQF7xakRMN.VquTvWp7m7JIqF7T37Tf2t9ARTbjBHCzRy');

SET FOREIGN_KEY_CHECKS = 1;
