const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./server'); // Make sure the path is correct

const expect = chai.expect;

chai.use(chaiHttp);

describe('Task Manager Server', () => {
    it('should return "Clock In recorded." when calling /clock-in endpoint', (done) => {
        chai.request(server)
            .post('/clock-in')
            .send({ currentDateTime: new Date().toISOString() })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('Clock In recorded.');
                done();
            });
    });

    it('should return "Break started." when calling /start-break endpoint', (done) => {
        chai.request(server)
            .post('/start-break')
            .send({ currentDateTime: new Date().toISOString() })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('Break started.');
                done();
            });
    });

    // Add more test cases for other endpoints...

    after(() => {
        // Perform any necessary cleanup after all tests are done
        // e.g., close server connections, reset database, etc.
    });
});
