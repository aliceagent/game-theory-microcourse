# MEDIA_MAP

Every file shipped from `public/media/` and `public/share/` is listed here with the hash of the exact bytes
that ship. `npm run qa:media` (`scripts/check-media.mjs`) enforces it and fails closed.

## Rules

1. **No unlisted media.** A file under `public/media/` or `public/share/` with no row here fails the check.
   Adding art is a two-step act: produce the file, then record it.
2. **Hash-bound.** Every row carries the `sha256` of the shipped bytes. Re-encode, re-crop or re-render an
   asset and the row must be updated in the same change — drift fails the check, it is never auto-healed.
3. **Source authority.** Each row says where the asset came from and under whose authority it exists: a local
   generation run, a deterministic script in this repo, or an approved pipeline stage. Nothing is "just there".
4. **Teaching purpose.** Each row says what the asset teaches or carries. An asset with no teaching job does
   not belong in the course.
5. **Approval state.** One of:
   - `deterministic` — produced by code in this repo, reproducible byte-for-byte, no human approval needed.
   - `provisional` — generated, hashed, and in the tree, but not yet approved for the shipped course.
   - `approved` — explicitly approved (lesson 1 gate).
   - `approved-pipeline` — produced by the pipeline that was approved at the lesson-1 gate.
6. **Paid stills are capped, not forbidden.** I2V first frames are xAI `grok-imagine-image` at $0.02 each. Hard series cap **$5**. xAI video API is prohibited. Posters may be extracted from the approved film at $0.
7. **The original lecture video is never re-hosted** (decision 13b). No row here may point at a copy of it.

## Assets

| File | Source authority | Teaching purpose | Approval state | sha256 |
| --- | --- | --- | --- | --- |
| `public/media/placeholder-poster.svg` | Deterministic paper-craft SVG authored in this repo (sprint 1) | Stands in for the lesson film on every lesson that has no MP4 yet, under the honest "Video in production" label | `deterministic` | `3fcd1236b014009c2e9c75980ecdb94c847530b1298ad3b5171b952d1bd5516c` |
| `public/media/lesson-01.mp4` | Lesson 1 v3 unique H3 chain + Eve + locked jazz mix; Jonathan 2026-09-09 picture pass + jazz volume lock | Marshmallow-test lecture film | `approved` | `5033278752930901606ed4d35ab039e1b6b7ccd2e58cb2f82b8b00d47cb0e9d0` |
| `public/media/lesson-01-poster.webp` | Frame extract from approved lesson-01.mp4 | Lesson 1 poster | `approved` | `bb31a0599b9a09f6418b96f2f3c405179a023419a77b6920f6176dbcb5c481c8` |
| `public/media/lesson-02.mp4` | Lesson 2 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4 | Delayed gratification and self-control lecture film | `approved` | `75ae84a3bbded9152ee89dd7cf2473b1cac9f6bb8847711e4a143abebd3522ca` |
| `public/media/lesson-02-poster.webp` | Frame extract from lesson-02.mp4 | Lesson 2 poster | `approved` | `42719cc31f3a999acd8d834f0963b32c6876dba76243352b6a8e0b2bcf6d166d` |
| `public/media/lesson-03.mp4` | Lesson 3 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4 | Growth mindset and resilience lecture film | `approved` | `ff7b7349c874092866e7649112c68371463b8f4b850181b520a308f7e5e42adc` |
| `public/media/lesson-03-poster.webp` | Frame extract from lesson-03.mp4 | Lesson 3 poster | `approved` | `bb050d5bdbb9205a4bd54c6659c85e27786c00d58fda9660e96fca792095a347` |
| `public/media/lesson-04.mp4` | Lesson 4 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4 | Deliberate practice and self-assessment lecture film | `approved` | `97fc453ea47127529b3a1eb8083cc22e985e248f5349345a0d3c4bd9ec326941` |
| `public/media/lesson-04-poster.webp` | Frame extract from lesson-04.mp4 | Lesson 4 poster | `approved` | `96a174de8732bf74b1a7f51a6fb63a687c807705598632b9626bb98d88cd1ca6` |
| `public/media/lesson-05.mp4` | Lesson 5 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768 redo after 1024 rejected; plaque QA pass max_w 1055 | Misjudging your own performance lecture film | `approved` | `a74c7b6f1ed75e870b96e5de4697f66d3e89aee946c23356b2159cda42a4ac89` |
| `public/media/lesson-05-poster.webp` | Frame extract from approved lesson-05.mp4 | Lesson 5 poster | `approved` | `55b4a887b4e70fbadd2e3022cf032480c3f3040cb15226dab1e41ac790ada0c9` |
| `public/media/lesson-06.mp4` | Lesson 6 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768 redo after 1024 rejected; plaque QA pass max_w 1089 | Correlation is not causation lecture film | `approved` | `249612737e8e40fb98dadc2674d16f103db4b12b76166ba64ce6979b6756799f` |
| `public/media/lesson-06-poster.webp` | Frame extract from approved lesson-06.mp4 | Lesson 6 poster | `approved` | `05fb9e037e9befeac8166c92e6d0bde897cca3e0a546430d79382e951ffb0be7` |
| `public/media/lesson-07.mp4` | Lesson 7 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768 redo after 1024/clipped-plaque reject; plaque QA pass max_w 1180 | Success as a cause of traits lecture film | `approved` | `f17b26ff05b46048c1e8ec56858fb9314d2ceaef9fb11b70221c65e8b434b516` |
| `public/media/lesson-07-poster.webp` | Frame extract from approved lesson-07.mp4 | Lesson 7 poster | `approved` | `b0e7b1bb3be33a5e5376b970e30fd0908197d0a0ff823014d5222d54518cd8fa` |
| `public/media/lesson-08.mp4` | Lesson 8 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; plaque QA pass max_w 1075 | Parenting difference one: communication lecture film | `approved` | `730b33964dd608e842a67bcf1731d526bb5a8db23c1b60233b3077f617fc9c77` |
| `public/media/lesson-08-poster.webp` | Frame extract from lesson-08.mp4 | Lesson 8 poster | `approved` | `059af8f4dff64e88aa79ea4918fe141441c1fbe882d58a10c467d89c13c5aa06` |
| `public/media/lesson-09.mp4` | Lesson 9 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; title wrapped onto plate after overflow reject | Parenting difference two: explanation or command lecture film | `approved` | `2a24c476d33daf78e049e36fa509d6c0b3e1b6312c2fd9e08216c2a0d0ff7e54` |
| `public/media/lesson-09-poster.webp` | Frame extract from approved lesson-09.mp4 | Lesson 9 poster | `approved` | `f496b7736406f69d219997e0b79dfd9bed76706bc2fdf61ff5a19b4da24a762b` |
| `public/media/lesson-10.mp4` | Lesson 10 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1028 | Feeling safe and meeting authority at school lecture film | `approved` | `35d8c692f59eab519468bb4f79215cd3a69a5f518b382afe0f15842cd75cb17b` |
| `public/media/lesson-10-poster.webp` | Frame extract from approved lesson-10.mp4 | Lesson 10 poster | `approved` | `21dc85b0ba21f93bfab48d4049e5b8f41a2eb6099f81749626336795660a4c55` |
| `public/media/lesson-11.mp4` | Lesson 11 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1078 | Parenting difference three: stability and promises lecture film | `approved` | `81a70323de0fc985105a3c79d7c9f3def1ca8ddfff02ccec3ccf78be634513fa` |
| `public/media/lesson-11-poster.webp` | Frame extract from approved lesson-11.mp4 | Lesson 11 poster | `approved` | `ff30abaf9eadb5057652afc9d1326aed33c77e873eb799f4a98d29c4af197091` |
| `public/media/lesson-12.mp4` | Lesson 12 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1179 | Reinterpreting the marshmallow test as trust lecture film | `approved` | `ad4310f63031d462b0305adb624c08837d1946d30ef2cca81ecaaf3afb36add9` |
| `public/media/lesson-12-poster.webp` | Frame extract from approved lesson-12.mp4 | Lesson 12 poster | `approved` | `ca09986d3465c7e8a01497cad04923a7ba283dc1355eea22909ac11dd4458ab1` |
| `public/media/lesson-13.mp4` | Lesson 13 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1129 | Rational adaptation and resilience lecture film | `approved` | `92ed4ababdc53f5de7a6ac9c92740f6552a5ca233ae53f5d30be6b1821039389` |
| `public/media/lesson-13-poster.webp` | Frame extract from approved lesson-13.mp4 | Lesson 13 poster | `approved` | `8be85fd69ddfb98aaa9627b9181117c3816d01e14d72d904cbd613f50d62b5de` |
| `public/media/lesson-14.mp4` | Lesson 14 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1108 | Stress, self-reflection and a school response lecture film | `approved` | `a48c081ed09a14375099fdf287ba8d139848195bbe9cb053dd162498ee7cbf14` |
| `public/media/lesson-14-poster.webp` | Frame extract from approved lesson-14.mp4 | Lesson 14 poster | `approved` | `0d3017a945fc73b1cd688911c621eb698e18f62df4cd509f760fc7be6cc89eab` |
| `public/media/lesson-15.mp4` | Lesson 15 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1125 | Why the lecturer turns to social hierarchy lecture film | `approved` | `77f00ae7dcb8de530528003929c03b0d363b027b527ed4bac2dec41a34a885bb` |
| `public/media/lesson-15-poster.webp` | Frame extract from approved lesson-15.mp4 | Lesson 15 poster | `approved` | `e23fb3d4e877fed7d5655f663ebf0997f92eb7365065d91a0aa9d3ac4b757277` |
| `public/media/lesson-16.mp4` | Lesson 16 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1058 | Different positions, different strategies lecture film | `approved` | `ab1eb707c9af4a1303e1f6a5297b9e1dbc86d369c48aa903532cc7bcb097e8a2` |
| `public/media/lesson-16-poster.webp` | Frame extract from approved lesson-16.mp4 | Lesson 16 poster | `approved` | `d20dc44b22d0957f04fb93b8ba4ac555aa40f41ac2d7362b059fce717468e091` |
| `public/media/lesson-17.mp4` | Lesson 17 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1099 | Parenting incentives beyond the child lecture film | `approved` | `d21d9c9b6855ec9c7847580fecbfdd4cc86ee4ce24fe6d999c7bda5afe613532` |
| `public/media/lesson-17-poster.webp` | Frame extract from approved lesson-17.mp4 | Lesson 17 poster | `approved` | `e077cafdf88d018a149083969bc03e73e34c0864d207128c9153926a18220c86` |
| `public/media/lesson-18.mp4` | Lesson 18 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1009 | Workplace obedience and family imitation lecture film | `approved` | `3d081401bbbdc95e0922f5f8ecf5835e98fc7b4621a677305279f6b001229562` |
| `public/media/lesson-18-poster.webp` | Frame extract from approved lesson-18.mp4 | Lesson 18 poster | `approved` | `1a44b8c41f8bc795b6b381073c23a22289fb17503f300d32a51b605f4f8093a6` |
| `public/media/lesson-19.mp4` | Lesson 19 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; wrapped title; plaque QA pass max_w 1116 | The social cost of parenting differently lecture film | `approved` | `2b3d4e2d267d1c026e10c1767ccad3c0acbb99e988c2172a5158146b0e08c926` |
| `public/media/lesson-19-poster.webp` | Frame extract from approved lesson-19.mp4 | Lesson 19 poster | `approved` | `72a8850bee1dcb1f4b387918312232fb6e526dfd261bf908ded1b01324859dab` |
| `public/media/lesson-20.mp4` | Lesson 20 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; larger wrapped title 44/40; plaque QA pass max_w 1152 | Freedom, family discussion and storytelling lecture film | `approved` | `3e171cab1d1b09dedd1c174f3dabb0d6a2ab7ec8a31a18e3ffe45a229ce6af90` |
| `public/media/lesson-20-poster.webp` | Frame extract from approved lesson-20.mp4 | Lesson 20 poster | `approved` | `5cd9d0240b369883fa0010b0d536dd6f7bed8099cd22cfa602cb8aaf0287606e` |
| `public/media/lesson-21.mp4` | Lesson 21 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; larger wrapped title 44/40; plaque QA pass max_w 1132 | Personal goals versus fitting in lecture film | `approved` | `d91fc8866ee6f4218e9eb9b6c26e70c830ada0b0ffbf2973712af2bd512406ab` |
| `public/media/lesson-21-poster.webp` | Frame extract from approved lesson-21.mp4 | Lesson 21 poster | `approved` | `2fbfe0c7ef3ac1490a00dccd6f7ab3fdfce7f7fb6839c75153249f54d1aa9bf9` |
| `public/media/lesson-22.mp4` | Lesson 22 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; larger wrapped title 44/40; plaque QA pass max_w 1120 | Conformity and rigid social structures lecture film | `approved` | `8451124d79ab893a22dee97d7ecd1239b55c22c5e39694eee3aba1ba42b91671` |
| `public/media/lesson-22-poster.webp` | Frame extract from approved lesson-22.mp4 | Lesson 22 poster | `approved` | `b00e551b217d196fb46dea0faba93f2f16ecfb8b362672cbd3f30d8f8f106b23` |
| `public/media/lesson-23.mp4` | Lesson 23 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; larger wrapped title 44/40; plaque QA pass max_w 1111 | A scholarship and leaving one's community lecture film | `approved` | `67fb6831c969dbc2502f8e441798cfd9852b8b207d10e7a511bba66513e011a2` |
| `public/media/lesson-23-poster.webp` | Frame extract from approved lesson-23.mp4 | Lesson 23 poster | `approved` | `ace3b85860afe06c31392e4a8d86f6a23f9868221ba77b43a16b35cdbe3aaf9b` |
| `public/media/lesson-24.mp4` | Lesson 24 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1077 | Leaving, safety and high-risk routes lecture film | `approved` | `f857e2111b7728d895c2de897e8f8a5ee9fac7951dedde07714cde250b96c70f` |
| `public/media/lesson-24-poster.webp` | Frame extract from approved lesson-24.mp4 | Lesson 24 poster | `approved` | `5bde8899a77d6c213032030cc6e5c1bde0fbaa5f484c4595be2516e78d11e9bb` |
| `public/media/lesson-25.mp4` | Lesson 25 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1076 | Mobility routes and the role of luck lecture film | `approved` | `14350ad71d66d524db486e2893ac7809c6f037d3a037ad923edb3f631c35154d` |
| `public/media/lesson-25-poster.webp` | Frame extract from approved lesson-25.mp4 | Lesson 25 poster | `approved` | `f02886b16bf968e3814951d7891fbbf603df39d853957c6e7eb3b95e40a2152f` |
| `public/media/lesson-26.mp4` | Lesson 26 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1038 | Can luck be part of a strategy lecture film | `approved` | `300e81c13f332790f8c5c8e124190c5abf7b46532beffb815dd033ec0b3e6623` |
| `public/media/lesson-26-poster.webp` | Frame extract from approved lesson-26.mp4 | Lesson 26 poster | `approved` | `1a309d63207023af6a40840c1384bd05c07097267f49b11478e640176c4aa73b` |
| `public/media/lesson-27.mp4` | Lesson 27 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1087 | Strategy, traits and luck together lecture film | `approved` | `95ef247fc59b8c7d626d5df44296edd4736f943717d70806fc9716baa17a0381` |
| `public/media/lesson-27-poster.webp` | Frame extract from approved lesson-27.mp4 | Lesson 27 poster | `approved` | `48dd34ecdccb4d9782e8e7de11562a791195c9a46fe5b508c03520b0fd3c0ea7` |
| `public/media/lesson-28.mp4` | Lesson 28 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1070 | Social equilibrium and the puzzle of change lecture film | `approved` | `44ca2586225644a8214e2ec4778021017ae8d045134c17050316001f07ea98c5` |
| `public/media/lesson-28-poster.webp` | Frame extract from approved lesson-28.mp4 | Lesson 28 poster | `approved` | `522786d695adfca06ce2e241683a0d4bb5aec912d4b3503a573b45c789d364d0` |
| `public/media/lesson-29.mp4` | Lesson 29 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1098 | High expectations inside the elite lecture film | `approved` | `b24f5a2e6fed07484e445138178e1bd2958efcf069f9a3705bb43990c6b17ded` |
| `public/media/lesson-29-poster.webp` | Frame extract from approved lesson-29.mp4 | Lesson 29 poster | `approved` | `b95dad0d2d639fcef3dbe9e790589703cde464150e105156b0f95c0f3132c23e` |
| `public/share/course.png` | xAI papercraft still + local title plate; 1200×630 Open Graph / Twitter card | Course social preview | `approved` | `d3055e010ea3957154057cfe6504136e8dcf74874cdebfe71f5f770274e01dd5` |
| `public/share/course-square.png` | xAI papercraft marshmallows + local title plate; 1080×1080 | Square share card | `approved` | `6ebf4e94cd4a1a0b673582cd073066748e33145e7eae7df5b916f17b3331d8ef` |
| `public/share/course-story.png` | xAI papercraft still + local title plate; 1080×1920 | Vertical / story share card | `approved` | `2ae108ad88190f0ea0381d25467d4df4bee6cab40ef1163e1e38865bcae606e0` |

## Not yet present

These land in later sprints and get their rows when the bytes exist — not before:

- `public/media/lesson-NN.mp4`, `lesson-NN-poster.webp`, `lesson-NN-narration.mp3` (sprints 6–7).
- `public/share/unit-N.png` (per-unit share cards).

`public/content/lesson-NN.json` and `src/content/course.ts` are **generated content, not media**: they are
built from `content/course.v2.json` by `scripts/build-content.mjs` on every build, so they are validated by
that script rather than hashed here.
