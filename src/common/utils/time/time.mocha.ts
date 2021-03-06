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
import { day, Duration, month, Timezone } from "chronoshift";
import { TimeRange } from "plywood";
import {
  appendDays,
  datesEqual,
  formatTimeBasedOnGranularity,
  getEndWallTimeInclusive,
  getWallTimeDay,
  getWallTimeMonthWithYear,
  prependDays
} from "./time";

describe("Time", () => {
  it("calculates date equality properly", () => {
    expect(datesEqual(null, new Date()), "null and not null").to.equal(false);
    expect(datesEqual(null, null), "null and null").to.equal(true);
    expect(datesEqual(new Date("1995-02-24T00:00:00.000Z"), new Date("1995-02-24T00:00:00.000Z")), "equal dates").to.equal(true);
    expect(datesEqual(new Date("1995-02-24T00:00:00.000Z"), new Date("1995-02-24T00:02:00.000Z")), "not equal dates").to.equal(false);
  });

  it("prepends days", () => {
    var testFirstWeek: Date[] = [];
    for (var i = 1; i < 5; i++) {
      testFirstWeek.push(new Date(Date.UTC(1995, 2, i)));
    }

    var prepended = prependDays(Timezone.UTC, testFirstWeek, 5);
    expect(prepended).to.deep.equal([
      new Date("1995-02-24T00:00:00.000Z"),
      new Date("1995-02-25T00:00:00.000Z"),
      new Date("1995-02-26T00:00:00.000Z"),
      new Date("1995-02-27T00:00:00.000Z"),
      new Date("1995-02-28T00:00:00.000Z"),
      new Date("1995-03-01T00:00:00.000Z"),
      new Date("1995-03-02T00:00:00.000Z"),
      new Date("1995-03-03T00:00:00.000Z"),
      new Date("1995-03-04T00:00:00.000Z")
    ]);
  });

  it("appends days", () => {
    var testWeek: Date[] = [];
    for (var i = 1; i < 5; i++) {
      testWeek.push(new Date(Date.UTC(1995, 2, i)));
    }

    var append = appendDays(Timezone.UTC, testWeek, 5);
    expect(append).to.deep.equal([
      new Date("1995-03-01T00:00:00.000Z"),
      new Date("1995-03-02T00:00:00.000Z"),
      new Date("1995-03-03T00:00:00.000Z"),
      new Date("1995-03-04T00:00:00.000Z"),
      new Date("1995-03-05T00:00:00.000Z"),
      new Date("1995-03-06T00:00:00.000Z"),
      new Date("1995-03-07T00:00:00.000Z"),
      new Date("1995-03-08T00:00:00.000Z"),
      new Date("1995-03-09T00:00:00.000Z")
    ]);
  });

  const TZ_KATHMANDU = new Timezone("Asia/Kathmandu"); // +5.8;
  const TZ_TIJUANA = new Timezone("America/Tijuana"); // -8.0
  const TZ_Kiritimati = new Timezone("Pacific/Kiritimati");  // +14.0

  it("gets human friendly end time which is -1 ms from actual end time", () => {
    var endExclusive = new Date("1995-03-09T00:00:00.000Z");
    var timezone = new Timezone("America/Tijuana");
    let quasiIsoFormat = "YYYY-MM-DD[T]HH:mm:ss.SSS";
    var endWallTimeInclusive = getEndWallTimeInclusive(endExclusive, timezone).format(quasiIsoFormat);
    expect(endWallTimeInclusive, "tijuana").to.equal("1995-03-08T15:59:59.999");
    endExclusive = new Date("1995-03-09T00:00:00.000Z");
    endWallTimeInclusive = getEndWallTimeInclusive(endExclusive, TZ_KATHMANDU).format(quasiIsoFormat);
    expect(endWallTimeInclusive, "kathmandu").to.equal("1995-03-09T05:44:59.999");
    endExclusive = new Date("1999-03-09T00:00:00.000Z");
    endWallTimeInclusive = getEndWallTimeInclusive(endExclusive, TZ_TIJUANA).format(quasiIsoFormat);
    expect(endWallTimeInclusive, "tijuana2").to.equal("1999-03-08T15:59:59.999");
    endExclusive = new Date("2016-02-28T00:00:00.000Z");
    endWallTimeInclusive = getEndWallTimeInclusive(endExclusive, TZ_Kiritimati).format(quasiIsoFormat);
    expect(endWallTimeInclusive, "kiritimati").to.equal("2016-02-28T13:59:59.999");
  });

  it("get walltime day returns day according to walltime", () => {
    var date = new Date("1995-03-09T00:00:00.000Z");
    expect(getWallTimeDay(date, TZ_TIJUANA), "tijuana walltime").to.equal(8);
    expect(getWallTimeDay(date, TZ_KATHMANDU), "kathmandu walltime").to.equal(9);
    expect(getWallTimeDay(date, TZ_Kiritimati), "kiritimati walltime").to.equal(9);
  });

  it("get walltime month returns full month and year according to walltime", () => {
    var date = new Date("1965-02-02T13:00:00.000Z");
    expect(getWallTimeMonthWithYear(date, TZ_TIJUANA), "basic tijuana").to.equal("February 1965");
    expect(getWallTimeMonthWithYear(date, TZ_KATHMANDU), "basic kathmandu").to.equal("February 1965");
    expect(getWallTimeMonthWithYear(date, TZ_Kiritimati), "basic kiritimati").to.equal("February 1965");
    date = new Date("1999-12-31T20:15:00.000Z");
    expect(getWallTimeMonthWithYear(date, TZ_TIJUANA), "y2k tijuana").to.equal("December 1999");
    expect(getWallTimeMonthWithYear(date, TZ_KATHMANDU), "y2k kathmandu").to.equal("January 2000");
    expect(getWallTimeMonthWithYear(date, TZ_Kiritimati), "y2k kiritimati").to.equal("January 2000");
  });

  it("formats time range based off of start walltime", () => {

    var locale = {
      shortDays: ["2"],
      weekStart: 0,
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
    };

    var start = new Date("1965-02-02T13:00:00.000Z");
    var end = day.shift(start, TZ_TIJUANA, 1);
    var gran = Duration.fromJS("PT1H");
    var range = new TimeRange({ start, end });
    expect(formatTimeBasedOnGranularity(range, gran, TZ_TIJUANA, locale), "hour tijuana").to.equal("Feb 2, 1965, 5am");

    start = new Date("1999-05-02T13:00:00.000Z");
    end = month.shift(start, TZ_TIJUANA, 1);
    gran = Duration.fromJS("PT1S");
    range = new TimeRange({ start, end });
    expect(formatTimeBasedOnGranularity(range, gran, TZ_TIJUANA, locale), "second tijuana").to.equal("May 2, 06:00:00");

    start = new Date("1999-05-02T13:00:00.000Z");
    end = month.shift(start, TZ_TIJUANA, 1);
    gran = Duration.fromJS("P1W");
    range = new TimeRange({ start, end });
    expect(formatTimeBasedOnGranularity(range, gran, TZ_TIJUANA, locale), "week tijuana").to.equal("May 2 - Jun 2, 1999 6am");

    start = new Date("1999-05-02T13:00:00.000Z");
    end = month.shift(start, TZ_KATHMANDU, 1);
    gran = Duration.fromJS("P1M");
    range = new TimeRange({ start, end });
    var monthFmt = formatTimeBasedOnGranularity(range, gran, TZ_KATHMANDU, locale);
    expect(monthFmt, "month granularity format").to.equal("May, 1999");
    var minFmt = formatTimeBasedOnGranularity(range, Duration.fromJS("PT1M"), TZ_KATHMANDU, locale);
    expect(minFmt, "minute granularity format").to.equal("May 2, 6:45pm");
    expect(monthFmt).to.not.equal(minFmt, "distinguishes between month and minute fmt");

  });

});
