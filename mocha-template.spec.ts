// Copy and Paste Mocha Spec with Superagent test.
// import * as _ from "lodash/fp";
import {after, before, describe, it} from "mocha";
// import express = require("express");
import assert = require("assert");
import request = require("superagent");

const rootUrl = "https://example.com";
const key = process.env.X_API_KEY || "";

describe("Test ZenForms Express Server APIs.", () => {

    before(() => {
    });

    describe(`Server at ${rootUrl} is up.`, () => {

        it ("Has the X_API_KEY env", () => {
            assert(key, "X_API_KEY ought to be defined.");
        });

        it("Should return the status 200", (done) => {
            request.get(`${rootUrl}/patients.json`)
                .set("X-Api-Key", key)
                .set("Content-Type", "text/plain")
                .end((err: Error, res: any) => {
                    if (err) {
                        assert.fail(`Got an error ${err}`);
                        done();
                    }
                    assert(res, "Null response");
                    const values = res.body as any[];
                    assert(values.length > 0, "No real JSON here");
                    done();
                });
        });

       
    after((done) => {
        done();
    });
});

