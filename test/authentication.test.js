const authentication=require('../model/authentication')

test('validate username',()=>{
    expect(authentication.validateUsername("aaa")).toBe(true)
    expect(authentication.validateUsername("a")).toBe(false)
    expect(authentication.validateUsername("aa")).toBe(false)
    expect(authentication.validateUsername("")).toBe(false)
    expect(authentication.validateUsername()).toBe(false)
    // banned name
    expect(authentication.validateUsername("about")).toBe(false)
})

test('validate password',()=>{
    expect(authentication.validatePassword("aaaa")).toBeTruthy()
    expect(authentication.validatePassword("aaa")).toBeFalsy()
    expect(authentication.validatePassword("a")).toBeFalsy()
    expect(authentication.validatePassword("aa")).toBeFalsy()
    expect(authentication.validatePassword("")).toBeFalsy()
    expect(authentication.validatePassword()).toBeFalsy()
    expect(authentication.validatePassword("about")).toBeTruthy()
})

test('encrypto',()=>{
    expect(authentication.encrypt("test")).toStrictEqual(authentication.encrypt("test","SHA256"))
})
