/*
 * Copyright 2015-2016 Imply Data, Inc.
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from "chai";
import { Dataset, TimeRange } from "plywood";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as TestUtils from "react-dom/test-utils";
import { StageMock } from "../../../common/models/mocks";
import { renderIntoDocument } from "../../utils/test-utils";
import { ChartLine } from "./chart-line";

describe("ChartLine", () => {
  it("adds the correct class", () => {
    var dataset = Dataset.fromJS([
      {
        TIME: {
          type: "TIME_RANGE",
          start: new Date("2015-01-26T00:00:00Z"),
          end: new Date("2015-01-26T01:00:00Z")
        },
        numberOfKoalas: 10,
        index: 0 // to return a simple x for testing purposes
      },
      {
        TIME: {
          type: "TIME_RANGE",
          start: new Date("2015-01-26T01:00:00Z"),
          end: new Date("2015-01-26T02:00:00Z")
        },
        numberOfKoalas: 12,
        index: 1 // to return a simple x for testing purposes
      }
    ]);

    var renderedComponent = renderIntoDocument(
      <ChartLine
        dataset={dataset}
        getX={d => d["TIME"] as TimeRange}
        getY={d => d["numberOfKoalas"]}
        scaleX={d => d["index"]}
        scaleY={d => 2}
        stage={StageMock.defaultA()}
        color={"yes"}
        showArea={null}
      />
    );

    expect(TestUtils.isCompositeComponent(renderedComponent), "should be composite").to.equal(true);
    expect(ReactDOM.findDOMNode(renderedComponent).className, "should contain class").to.contain("chart-line");
  });
});
