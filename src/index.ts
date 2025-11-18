/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

interface Env {
	DB: D1Database;
	AUDREYT_TRANSCRIPT_TOKEN: string;
	BESTIAN_TRANSCRIPT_TOKEN: string;
}

// 允許的來源白名單
const ALLOWED_ORIGINS = [
	'http://localhost:5173', // 本地開發環境
	'https://sayit-f5d.pages.dev/',
	'https://sayit.archive.tw/',
	// 可以根據需要添加更多允許的來源
];

const ALLOWED_GITHUB_REPOS = {
	'audreyt/transcript': 'AUDREYT_TRANSCRIPT_TOKEN',
	'bestian/transcript': 'BESTIAN_TRANSCRIPT_TOKEN',
} as const;

type AllowedRepo = keyof typeof ALLOWED_GITHUB_REPOS;
type AllowedRepoSecret = typeof ALLOWED_GITHUB_REPOS[AllowedRepo];

// 檢查來源是否被允許
function isOriginAllowed(origin: string | null) {
	if (!origin) {
		return false;
	}
	return ALLOWED_ORIGINS.includes(origin);
}

function timingSafeEqual(a: string, b: string) {
	if (a.length !== b.length) {
		return false;
	}
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}

// 僅允許指定儲存庫的 GitHub Action 請求（使用 Bearer token）
function isAuthorizedGitHubAction(request: Request, env: Env): boolean {
	const repo = request.headers.get('X-GitHub-Repository') as AllowedRepo | null;
	if (!repo || !(repo in ALLOWED_GITHUB_REPOS)) {
		return false;
	}

	const expectedEnvKey = ALLOWED_GITHUB_REPOS[repo];
	const expectedToken = env[expectedEnvKey as AllowedRepoSecret];
	if (!expectedToken) {
		return false;
	}

	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return false;
	}

	const providedToken = authHeader.substring('Bearer '.length).trim();
	return timingSafeEqual(providedToken, expectedToken);
}

// 動態生成 CORS headers
function getCorsHeaders(origin: string | null, isGitHubActionRequest: boolean = false) {
	const normalizedOrigin = origin || '';
	const isAllowedOrigin = isGitHubActionRequest ? true : isOriginAllowed(normalizedOrigin);

	// 如果是 GitHub Actions 請求，允許所有方法；否則前端只能使用 GET
	const allowedMethods = isGitHubActionRequest
		? 'GET, POST, PATCH, OPTIONS'
		: 'GET, OPTIONS';

	return {
		'Access-Control-Allow-Origin': isGitHubActionRequest
			? '*'
			: isAllowedOrigin
				? normalizedOrigin
				: 'null',
		'Access-Control-Allow-Methods': allowedMethods,
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-GitHub-Repository',
		'Access-Control-Max-Age': '86400', // 24 hours
		'Vary': 'Origin', // 重要：告訴快取這個回應會根據 Origin 而變化
	};
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const origin = request.headers.get('Origin');
		const isGitHubActionRequest = isAuthorizedGitHubAction(request, env);

		// 處理 CORS preflight 請求
		if (request.method === 'OPTIONS') {
			const corsHeaders = getCorsHeaders(origin, isGitHubActionRequest);

			// 如果來源不被允許且不是 GitHub Actions，返回錯誤
			if (!isGitHubActionRequest && !isOriginAllowed(origin)) {
				return new Response('Origin not allowed', {
					status: 403,
					headers: corsHeaders,
				});
			}

			return new Response(null, {
				status: 200,
				headers: corsHeaders,
			});
		}

		// 檢查請求方法：前端只能使用 GET，GitHub Actions 可以使用 POST 和 PATCH
		if (!isGitHubActionRequest && (request.method === 'POST' || request.method === 'PATCH')) {
			const corsHeaders = getCorsHeaders(origin, false);
			return new Response('Method not allowed for frontend requests', {
				status: 405,
				headers: corsHeaders,
			});
		}

		const pathname = new URL(request.url).pathname;
		const corsHeaders = getCorsHeaders(origin, isGitHubActionRequest);

		return new Response('Hello World!', {
			headers: corsHeaders,
		});
	},
} satisfies ExportedHandler<Env>;
