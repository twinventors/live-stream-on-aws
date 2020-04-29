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

const generateProfile = (VideoBitrate,
                         AudioBitrate,
                         Width,
                         Height,
                         AudioProfileIndex,
                         Index,
                         GopSize = 20,
                         GopNumBFrames = 2,
                         FrameNumerator = GopSize * 1000,
                         FrameDenominator = 1001,
) => ({
  VideoBitrate,
  AudioBitrate,
  Width,
  Height,
  AudioProfileIndex,
  Index,
  GopSize,
  GopNumBFrames,
  FrameNumerator,
  FrameDenominator,
});

const _540Profile = [
  generateProfile(200000, 64000, 416, 234, 1, undefined, 20, 0, 15000),
  generateProfile(400000, 64000, 480, 272, 2, undefined, 20, 2, 15000),
  generateProfile(800000, 64000, 640, 360, 3, undefined, 20, 2),
  generateProfile(1200000, 96000,768, 432, 1),
  generateProfile(2200000, 96000,960, 540, 2),
];

const _720Profile = [
  ..._540Profile,
  generateProfile(3300000, 96000, 1280, 720, 3, 1),
  generateProfile(5000000, 128000, 1280, 720, 1, 2),
  generateProfile(6500000, 128000, 1280, 720, 2, 3),
];

const _1080Profile = [
  ..._720Profile,
  generateProfile(8000000, 128000, 1920, 1080, 3, undefined, 60, 1, 30000),
];

const AvailConfiguration = {
  "AvailSettings": {
    "Scte35SpliceInsert": {
      "NoRegionalBlackoutFlag": "FOLLOW",
        "WebDeliveryAllowedFlag": "FOLLOW"
    }
  }
};

const generateAudioDescription = (Profile = generateProfile()) => ({
  "AudioSelectorName": "default",
  "AudioTypeControl": "FOLLOW_INPUT",
  "CodecSettings": {
    "AacSettings": {
      "Bitrate": Profile.AudioBitrate,
      "RawFormat": "NONE",
      "Spec": "MPEG4"
    }
  },
  "LanguageCodeControl": "FOLLOW_INPUT",
  "Name": ["audio", Profile.AudioProfileIndex, "aac" + Profile.AudioBitrate.toString().substring(0, Profile.AudioBitrate.toString().length - 3)].join("_")
});

const HlsOutputSettings = (Profile = generateProfile()) => ({
  "HlsOutputSettings": {
    "HlsSettings": {
      "StandardHlsSettings": {
        "AudioRenditionSets": "PROGRAM_AUDIO",
        "M3u8Settings": {
          "AudioFramesPerPes": 4,
          "AudioPids": "492-498",
          "EcmPid": "8182",
          "PcrControl": "PCR_EVERY_PES_PACKET",
          "PmtPid": "480",
          "ProgramNum": 1,
          "Scte35Behavior": "PASSTHROUGH",
          "Scte35Pid": "500",
          "TimedMetadataPid": "502",
          "TimedMetadataBehavior": "NO_PASSTHROUGH",
          "VideoPid": "481"
        }
      }
    },
    "NameModifier": ["", Profile.Width + "x" + Profile.Height, (Profile.VideoBitrate / 1000).toString() + "k"].join("_")
  }
});

const MediaPackageOutputSettings = {
  "MediaPackageOutputSettings": {}
};

const generateOutput = (Profile = generateProfile(), useMediaPackage = false) => ({
  "AudioDescriptionNames": [
    ["audio", Profile.AudioProfileIndex, "aac" + Profile.AudioBitrate.toString().substring(0, Profile.AudioBitrate.toString().length - 3)].join("_")
  ],
  "CaptionDescriptionNames": [],
  "OutputSettings": useMediaPackage ? MediaPackageOutputSettings : HlsOutputSettings(Profile),
  "VideoDescriptionName": ["video", Profile.Width, Profile.Height + (Profile.Index ? "_" + Profile.Index : "")].join("_")
});

const Destination = {
  "DestinationRefId": "destination1"
};

const MediaPackageGroupSettings = {
  "MediaPackageGroupSettings": {
    Destination,
  }
};

const HlsGroupSettings = {
  "HlsGroupSettings": {
    "AdMarkers": [
      "ELEMENTAL_SCTE35"
    ],
    "CaptionLanguageMappings": [],
    "CaptionLanguageSetting": "OMIT",
    "ClientCache": "ENABLED",
    "CodecSpecification": "RFC_4281",
    Destination,
    "DirectoryStructure": "SINGLE_DIRECTORY",
    "HlsCdnSettings": {
      "HlsBasicPutSettings": {
        "ConnectionRetryInterval": 30,
        "FilecacheDuration": 300,
        "NumRetries": 5,
        "RestartDelay": 5
      }
    },
    "IndexNSegments": 10,
    "InputLossAction": "EMIT_OUTPUT",
    "IvInManifest": "INCLUDE",
    "IvSource": "FOLLOWS_SEGMENT_NUMBER",
    "KeepSegments": 21,
    "ManifestCompression": "NONE",
    "ManifestDurationFormat": "FLOATING_POINT",
    "Mode": "LIVE",
    "OutputSelection": "MANIFESTS_AND_SEGMENTS",
    "ProgramDateTime": "INCLUDE",
    "ProgramDateTimePeriod": 600,
    "SegmentLength": 1,
    "SegmentationMode": "USE_SEGMENT_DURATION",
    "SegmentsPerSubdirectory": 10000,
    "StreamInfResolution": "INCLUDE",
    "TimedMetadataId3Frame": "PRIV",
    "TimedMetadataId3Period": 10,
    "TsFileMode": "SEGMENTED_FILES"
  }
};

const generateOutputGroup = (Profiles = _540Profile, useMediaPackage = false, outputGroupName = "TN2224") => ([{
  "Name": outputGroupName,
  "OutputGroupSettings": useMediaPackage ? MediaPackageGroupSettings : HlsGroupSettings,
  "Outputs": Profiles.map((profile) => generateOutput(profile, useMediaPackage)),
}]);

const TimecodeConfig = {
  "Source": "SYSTEMCLOCK"
};

generateVideoDescription = (Profile = generateProfile(200000, 416, 234)) => ({
"CodecSettings": {
  "H264Settings": {
    "AdaptiveQuantization": "MEDIUM",
    "Bitrate": Profile.VideoBitrate,
    "ColorMetadata": "INSERT",
    "EntropyEncoding": Profile.VideoBitrate >= 800000 ? "CABAC" : "CAVLC",
    "FlickerAq": "ENABLED",
    "FramerateControl": "SPECIFIED",
    "FramerateDenominator": Profile.FrameDenominator,
    "FramerateNumerator": Profile.FrameNumerator,
    "GopBReference": Profile.VideoBitrate >= 800000 ? "ENABLED" : "DISABLED",
    "GopNumBFrames": Profile.GopNumBFrames,
    "BufSize": Profile.VideoBitrate,
    "GopSize": Profile.GopSize,
    "GopSizeUnits": "FRAMES",
    "Level": Profile.VideoBitrate >= 1200000 ? "H264_LEVEL_4_1" : "H264_LEVEL_3",
    "LookAheadRateControl": "MEDIUM",
    "ParControl": "INITIALIZE_FROM_SOURCE",
    "Profile": Profile.VideoBitrate >= 800000 ? "MAIN" : "BASELINE",
    "RateControlMode": "CBR",
    "SceneChangeDetect": "ENABLED",
    "SpatialAq": "ENABLED",
    "Syntax": "DEFAULT",
    "TemporalAq": "DISABLED",
    "TimecodeInsertion": "DISABLED",
    "NumRefFrames": 1,
    "AfdSignaling": "NONE"
    }
  },
  "Height": Profile.Height,
  "Name": ["video", Profile.Width, Profile.Height + (Profile.Index ? "_" + Profile.Index : "")].join("_"),
  "ScalingBehavior": "DEFAULT",
  "Width": Profile.Width,
  "RespondToAfd": "NONE",
  "Sharpness": 50
});

const generateProfileManifest = (Profiles = _540Profile, useMediaPackage = false) => ({
  AvailConfiguration,
  "AudioDescriptions": Profiles.map(generateAudioDescription),
  "OutputGroups": generateOutputGroup(Profiles, useMediaPackage),
  TimecodeConfig,
  "VideoDescriptions": Profiles.map(generateVideoDescription)
});

module.exports = {
  generateProfile: () => generateProfileManifest()
};