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
import { testImmutableClass } from "immutable-class-tester";

import { DataCubeMock } from "../data-cube/data-cube.mock";
import { AppSettings } from "./app-settings";
import { AppSettingsMock } from "./app-settings.mock";

describe("AppSettings", () => {
  var context = AppSettingsMock.getContext();

  it("is an immutable class", () => {
    testImmutableClass(
      AppSettings,
      [
        AppSettingsMock.wikiOnlyJS(),
        AppSettingsMock.wikiTwitterJS(),
        AppSettingsMock.wikiWithLinkViewJS()
      ],
      { context });
  });

  describe("errors", () => {
    it("errors if there is no matching cluster", () => {
      var js = AppSettingsMock.wikiOnlyJS();
      js.clusters = [];
      expect(() => AppSettings.fromJS(js, context)).to.throw("Can not find cluster 'druid-wiki' for data cube 'wiki'");
    });

  });

  describe("back compat", () => {
    it("works with dataSources", () => {
      var oldJS: any = AppSettingsMock.wikiOnlyJS();
      oldJS.dataSources = oldJS.dataCubes;
      delete oldJS.dataCubes;
      expect(AppSettings.fromJS(oldJS, context).toJS()).to.deep.equal(AppSettingsMock.wikiOnlyJS());
    });

    it("deals with old config style", () => {
      var wikiDataCubeJS = DataCubeMock.WIKI_JS;
      delete wikiDataCubeJS.clusterName;
      (wikiDataCubeJS as any).engine = "druid";

      var oldJS: any = {
        customization: {},
        druidHost: "192.168.99.100",
        timeout: 30003,
        sourceListScan: "auto",
        sourceListRefreshInterval: 10001,
        sourceReintrospectInterval: 10002,
        sourceReintrospectOnLoad: true,
        dataSources: [
          wikiDataCubeJS
        ]
      };

      expect(AppSettings.fromJS(oldJS, context).toJS().clusters).to.deep.equal([
        {
          name: "druid",
          type: "druid",
          host: "192.168.99.100",
          sourceListRefreshInterval: 10001,
          sourceListScan: "auto",
          sourceReintrospectInterval: 10002,
          sourceReintrospectOnLoad: true,
          timeout: 30003
        }
      ]);
    });

    it("deals with old config style no sourceListScan=disabled", () => {
      var oldJS: any = {
        druidHost: "192.168.99.100",
        sourceListScan: "disable",
        dataSources: [
          { ...DataCubeMock.WIKI_JS, clusterName: "druid" }
        ]
      };

      expect(AppSettings.fromJS(oldJS, context).toJS().clusters).to.deep.equal([
        {
          host: "192.168.99.100",
          name: "druid",
          sourceListScan: "disable",
          type: "druid"
        }
      ]);
    });

  });

  describe("general", () => {
    it("blank", () => {
      expect(AppSettings.BLANK.toJS()).to.deep.equal({
        clusters: [],
        customization: {},
        dataCubes: []
      });
    });

    it("converts to client settings", () => {
      const settings = AppSettingsMock.wikiOnlyWithExecutor();

      expect(settings.toClientSettings().toJS()).to.deep.equal({
        clusters: [
          {
            name: "druid-wiki",
            type: "druid"
          }
        ],
        customization: {
          customLogoSvg: "ansvgstring",
          headerBackground: "brown",
          title: "Hello World"
        },
        dataCubes: [
          {
            attributes: [
              {
                name: "time",
                type: "TIME"
              },
              {
                name: "articleName",
                type: "STRING"
              },
              {
                name: "page",
                type: "STRING"
              },
              {
                name: "userChars",
                type: "SET/STRING"
              },
              {
                maker: {
                  op: "count"
                },
                name: "count",
                type: "NUMBER",
                unsplitable: true
              }
            ],
            clusterName: "druid-wiki",
            defaultDuration: "P3D",
            defaultFilter: {
              op: "literal",
              value: true
            },
            defaultPinnedDimensions: [
              "articleName"
            ],
            defaultSelectedMeasures: [
              "count"
            ],
            defaultSortMeasure: "count",
            defaultTimezone: "Etc/UTC",
            description: "Wiki description",
            dimensions: [
              {
                formula: "$time",
                kind: "time",
                name: "time",
                title: "Time"
              },
              {
                formula: "$channel",
                kind: "string",
                name: "channel",
                title: "Channel"
              },
              {
                name: "comment_group",
                title: "Comment Group",
                dimensions: [
                  {
                    kind: "string",
                    name: "comment",
                    title: "Comment",
                    formula: "$comment"
                  },
                  {
                    kind: "number",
                    name: "commentLength",
                    title: "Comment Length",
                    formula: "$commentLength"
                  },
                  {
                    kind: "boolean",
                    name: "commentLengthOver100",
                    title: "Comment Length Over 100",
                    formula: "$commentLength > 100"
                  }
                ]
              },
              {
                formula: "$isRobot",
                kind: "string",
                name: "isRobot",
                title: "Is Robot"
              },
              {
                kind: "string",
                name: "namespace",
                title: "Namespace",
                formula: "$namespace"
              },
              {
                formula: "$articleName",
                kind: "string",
                name: "articleName",
                title: "Article Name"
              },
              {
                formula: "$page",
                kind: "string",
                name: "page",
                title: "Page"
              },
              {
                formula: "$userChars",
                kind: "string",
                name: "userChars",
                title: "User Chars"
              }
            ],
            measures: [
              {
                formula: "$main.sum($count)",
                name: "count",
                title: "Count"
              },
              {
                name: "other",
                title: "Other",
                measures: [
                  {
                    name: "added_group",
                    title: "Added Group",
                    measures: [
                      {
                        name: "added",
                        title: "Added",
                        formula: "$main.sum($added)"
                      },
                      {
                        name: "avg_added",
                        title: "Avg Added",
                        formula: "$main.average($added)"
                      }
                    ]
                  },
                  {
                    name: "delta_group",
                    title: "Delta Group",
                    measures: [
                      {
                        name: "delta",
                        title: "Delta",
                        formula: "$main.sum($delta)"
                      },
                      {
                        name: "avg_delta",
                        title: "Avg Delta",
                        formula: "$main.average($delta)"
                      }
                    ]
                  }
                ]
              }
            ],
            name: "wiki",
            refreshRule: {
              rule: "fixed",
              time: new Date("2016-04-30T12:39:51.350Z")
            },
            source: "wiki",
            timeAttribute: "time",
            title: "Wiki"
          }
        ]
      });
    });

  });

});
