/**
 * IMPORTANT (PLEASE READ THIS):
 *
 * This is not the "configuration file" of mediasoup. This is the configuration
 * file of the mediasoup-demo app. mediasoup itself is a server-side library, it
 * does not read any "configuration file". Instead it exposes an API. This demo
 * application just reads settings from this file (once copied to config.js) and
 * calls the mediasoup API with those settings when appropriate.
 */

const os = require('os');

module.exports =
{
	// Listening hostname (just for `gulp live` task).
	domain : 'localhost',
	// Signaling settings (protoo WebSocket server and HTTP API server).
	https  :
	{
		listenIp   : '0.0.0.0',
		// NOTE: Don't change listenPort (client app assumes 4443).
		listenPort : parseInt(process.env.serverPort) || 4443
		// NOTE: Set your own valid certificate files.
		// tls        :
		// {
		// 	cert : `${__dirname}/certs/mediasoup-demo.localhost.cert.pem`,
		// 	key  : `${__dirname}/certs/mediasoup-demo.localhost.key.pem`
		// }
	},
	// mediasoup settings.
	mediasoup :
	{
		activeSpeakerDBLevel    : parseInt(process.env.activeSpeakerDBLevel) || -50,
		activeSpeakeriInterval  : parseInt(process.env.activeSpeakeriInterval) || 800,
		activeSpeakerMaxEntries : parseInt(process.env.activeSpeakerMaxEntries) || 1,
		// Number of mediasoup workers to launch.
		numWorkers              : Object.keys(os.cpus()).length,
		// mediasoup WorkerSettings.
		// See https://mediasoup.org/documentation/v3/mediasoup/api/#WorkerSettings
		workerSettings          :
		{
			logLevel : process.env.logLevel || 'warn',
			logTags  :
			[
				'info',
				'ice',
				'dtls',
				'rtp',
				'srtp',
				'rtcp',
				'rtx',
				'bwe',
				'score',
				'simulcast',
				'svc',
				'sctp'
			],
			rtcMinPort : 40000,
			rtcMaxPort : 49999
		},
		// mediasoup Router options.
		// See https://mediasoup.org/documentation/v3/mediasoup/api/#RouterOptions
		routerOptions :
		{
			mediaCodecs :
			[
				{
					kind      : 'audio',
					mimeType  : 'audio/opus',
					clockRate : 48000,
					channels  : 2
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP8',
					clockRate  : 90000,
					parameters :
					{
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/VP9',
					clockRate  : 90000,
					parameters :
					{
						'profile-id'             : 2,
						'x-google-start-bitrate' : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '4d0032',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				},
				{
					kind       : 'video',
					mimeType   : 'video/h264',
					clockRate  : 90000,
					parameters :
					{
						'packetization-mode'      : 1,
						'profile-level-id'        : '42e01f',
						'level-asymmetry-allowed' : 1,
						'x-google-start-bitrate'  : 1000
					}
				}
			]
		},
		// mediasoup WebRtcTransport options for WebRTC endpoints (mediasoup-client,
		// libmediasoupclient).
		// See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
		webRtcTransportOptions :
		{
			listenIps :
			[
				{ ip: '127.0.0.1', announcedIp: process.env.announcedIp || null }
			],
			initialAvailableOutgoingBitrate : parseInt(process.env.initialAvailableOutgoingBitrate) || 1000000,
			minimumAvailableOutgoingBitrate : parseInt(process.env.minimumAvailableOutgoingBitrate) || 600000,
			maxSctpMessageSize              : 262144,
			// Additional options that are not part of WebRtcTransportOptions.
			maxIncomingBitrate              : 1500000
		},
		// mediasoup PlainRtpTransport options for legacy RTP endpoints (FFmpeg,
		// GStreamer).
		// See https://mediasoup.org/documentation/v3/mediasoup/api/#PlainRtpTransportOptions
		plainRtpTransportOptions :
		{
			listenIp           : { ip: '127.0.0.1', announcedIp: null },
			maxSctpMessageSize : 262144
		}
	}
};
