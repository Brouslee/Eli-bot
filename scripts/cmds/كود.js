const { removeHomeDir, log } = global.utils;

module.exports = {
	config: {
		
		name: "eval",
		aliases: ["evall", "ev"],
		version: "1.6",
		author: "sifo anter",
		countDown: 5,
		role: 2,
		description: {
			vi: "Test code nhanh",
			en: "Test code quickly",
			ar: "جرب كودك بعناية"
		},
		category: "المطور",
		guide: {
			vi: "{pn} <đoạn code cần test>",
			en: "{pn} <code to test>",
			ar: "{pn} <الكود>"
		}
	},

	langs: {
		vi: {
			error: "❌ Đã có lỗi xảy ra:"
		},
		en: {
			error: "❌ An error occurred:"
		},
		ar: {
			error: "❌ حدث خطأ في الكود:"
		}
	},

	onStart: async function (runner) {
        const { api, args, message, event, threadsData, usersData, globalData, threadModel, userModel, globalModel, role, commandName, getLang } = runner;
		function output(msg) {
			if (typeof msg == "number" || typeof msg == "boolean" || typeof msg == "function")
				msg = msg.toString();
			else if (msg instanceof Map) {
				let text = `Map(${msg.size}) `;
				text += JSON.stringify(mapToObj(msg), null, 2);
				msg = text;
			}
			else if (typeof msg == "object")
				msg = JSON.stringify(msg, null, 2);
			else if (typeof msg == "undefined")
				msg = "undefined";

			message.reply(msg);
		}
		function out(msg) {
			output(msg);
		}
		اوت = out;
		function mapToObj(map) {
			const obj = {};
			map.forEach(function (v, k) {
				obj[k] = v;
			});
			return obj;
		}
		const cmd = `
		(async () => {
			try {
				${args.join(" ")}
			}
			catch(err) {
				log.err("eval command", err);
				message.send(
					"${getLang("error")}\\n" +
					(err.stack ?
						removeHomeDir(err.stack) :
						removeHomeDir(JSON.stringify(err, null, 2) || "")
					)
				);
			}
		})()`;
		eval(cmd);
	}
};
