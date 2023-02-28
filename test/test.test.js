const DBManager = require("./db-handler");

const dbman = new DBManager();

afterAll(() => dbman.stop());
beforeAll(() => dbman.start());
afterEach(() => dbman.cleanup());

/**
 * Product test suite.
 */
describe('product ', () => {
    it('can be created correctly', async () => {
        expect(async () => {
            await userModel.login("test123")
        });
    });
});
