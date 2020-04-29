/*******************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License Version 2.0 (the "License"). You may not
 *  use this file except in compliance with the License. A copy of the License is
 *  located at
 *
 *      http://www.apache.org/licenses/
 *
 *  or in the "license" file accompanying this file. This file is distributed on
 *  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or
 *  implied. See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/

let assert = require('chai').assert;
let expect = require('chai').expect;
const util = require('util');

let lambda = require('./generate-encoding-profiles');
let test540p = require('./encoding-profiles/medialive-540p');
let test720p = require('./encoding-profiles/medialive-720p');
let test1080p = require('./encoding-profiles/medialive-1080p');

describe('Profile', () => {
  it('cool', () => {
    let response = lambda.gen();


    response.AudioDescriptions.sort(audioDescriptorSort);
    test540p.AudioDescriptions.sort(audioDescriptorSort);

    response.OutputGroups[0].Outputs.sort(outputsSort);
    test540p.OutputGroups[0].Outputs.sort(outputsSort);
    // response.OutputGroups[0].OutputGroupSettings.HlsGroupSettings

    // console.log(util.inspect(response, {showHidden: false, depth: null}));

    expect(response).to.equal(test540p);

    // console.log(response);
  });
});

const audioDescriptorSort = (l, r) => (
  l.CodecSettings.AacSettings.Bitrate > r.CodecSettings.AacSettings.Bitrate ? 1 :
    l.Name > r.Name ? 1 : -1
);

const outputsSort = (l, r) => (
  l.AudioDescriptionNames[0] > r.AudioDescriptionNames[0] ? 1 : -1
);