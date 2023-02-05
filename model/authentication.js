const { response } = require('express');

const cryptoJS = require('crypto-js')
const bannedName=require('../public/username_exclude.json').name

class authentication{
    /**
     * validate username, case insensitive
     * @param {String} username 
     * @returns if length of username < 3, return false
     *          if username exists, return false
     *          if username is banned, return false
     *          else return true
     */
    static validateUsername(username){
        if(!username || username.length<3) return false
        username=username.toLowerCase()
        // banned name
        if(bannedName.indexOf(username)!=-1) return false;
        // checkDuplicate(username)
        return true
    }

    /**
     * todo: should not be plain text
     * validate password
     * @param {string} password 
     * @returns if length of password < 4, retrun false
     *          else return false
     */
    static validatePassword(password){
        if(!password || password.length<4) return false
        return true
    }

    static encrypt(password,crypto='SHA256'){
        return cryptoJS[crypto](password)
    }
}

module.exports = authentication
