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
| `public/media/lesson-30.mp4` | Lesson 30 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1096 | Zero-sum power and elite overproduction lecture film | `approved` | `066537bed2399a0c7b1437f9a1c7ab5e904e045c2860f0858454c33d77d68588` |
| `public/media/lesson-30-poster.webp` | Frame extract from approved lesson-30.mp4 | Lesson 30 poster | `approved` | `7d1d04ab9f766d452562fe992f16d7c81e7e40cf59029478365935bf4c705a4c` |
| `public/media/lesson-31.mp4` | Lesson 31 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1145 | Debt, slavery and landlessness lecture film | `approved` | `7cff0fee1e0d21b9f5896aa3fef1da6738de5e0eee28603a81317f5def6ac8c7` |
| `public/media/lesson-31-poster.webp` | Frame extract from approved lesson-31.mp4 | Lesson 31 poster | `approved` | `5dc530e8c8730fc2f17745fd2024dce14ad9d47340844734b0e363eab7b517e5` |
| `public/media/lesson-32.mp4` | Lesson 32 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1122 | The revolutionary bargain lecture film | `approved` | `c595c64011f93a5178e9f3d58afe0c4ff5480c900c5291bcf262892fbb6fc68e` |
| `public/media/lesson-32-poster.webp` | Frame extract from approved lesson-32.mp4 | Lesson 32 poster | `approved` | `58c95e36c4869a41d323d8694fe3f1c5c9d22cc40db5c99008335ccce0060db7` |
| `public/media/lesson-33.mp4` | Lesson 33 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1126 | Historical examples of the bargain lecture film | `approved` | `f40000302e1340dae5d62fd8a853a8a8337036622eaabbd7ca7d1aabec2ba734` |
| `public/media/lesson-33-poster.webp` | Frame extract from approved lesson-33.mp4 | Lesson 33 poster | `approved` | `bc130157926f5381631a9480294a9d0cc5b8463b17d4ce54797c92661bace819` |
| `public/media/lesson-34.mp4` | Lesson 34 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1006 | Debt cancellation and the power of a ruler lecture film | `approved` | `a54b6f0436d2e74475beabc434fe2dbb511fcafe8ff9815bd1f867ab3d31bf8b` |
| `public/media/lesson-34-poster.webp` | Frame extract from approved lesson-34.mp4 | Lesson 34 poster | `approved` | `068eabd945d28fbf32afda7e07e3a207fc78c2367214fcd44e4699bacd7272e8` |
| `public/media/lesson-35.mp4` | Lesson 35 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1102 | From individual outcomes to social mobility lecture film | `approved` | `89b2620450e9016101bd46ca316371d59595e9a940540d5d88c5a636b220d26d` |
| `public/media/lesson-35-poster.webp` | Frame extract from approved lesson-35.mp4 | Lesson 35 poster | `approved` | `058088d830d24930c9ef66220b6b59b6521c46030cc14c3b18b476758e158112` |
| `public/media/lesson-36.mp4` | Lesson 36 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1116 | Mobility across different political systems lecture film | `approved` | `a62e41b35f3fdf28f6a14850837e7d4b4dcfb41c857d580d1c1684ebead2a133` |
| `public/media/lesson-36-poster.webp` | Frame extract from approved lesson-36.mp4 | Lesson 36 poster | `approved` | `c055b5d1c955c193cdbf74cb9946792111e6ed49f8872991f3e6044429360766` |
| `public/media/lesson-37.mp4` | Lesson 37 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1046 | Inherited advantage and the closing ladder lecture film | `approved` | `b92ed17e71ec9405a0d9764140901f2e89fb20fb6548a524291b07a05d84d760` |
| `public/media/lesson-37-poster.webp` | Frame extract from approved lesson-37.mp4 | Lesson 37 poster | `approved` | `37042d36fbb7d15bae3e6fc41c3a75c30ac60bce664ab1301ccaa05ac391814b` |
| `public/media/lesson-38.mp4` | Lesson 38 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1096 | Blocked mobility and revolutionary challengers lecture film | `approved` | `4a6c6318d13e9158f3267a03e4d87959509210aa50881c9ec1f7829ee3824303` |
| `public/media/lesson-38-poster.webp` | Frame extract from approved lesson-38.mp4 | Lesson 38 poster | `approved` | `d50e4138ab73920667c55795e009b7190da1ceccbce1f98e2202541def6b5c54` |
| `public/media/lesson-39.mp4` | Lesson 39 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1038 | Revolution as a game reset lecture film | `approved` | `02ab548df9835853d192c2a1babf6cdd39cbf23b1ce57edccc1d80645d2ac07a` |
| `public/media/lesson-39-poster.webp` | Frame extract from approved lesson-39.mp4 | Lesson 39 poster | `approved` | `64ef2f6529ef20b50c73df15c9dcbea043adc47274b9fb5326995428ab9a4c71` |
| `public/media/lesson-40.mp4` | Lesson 40 v3 unique H3 chain + Eve + plaques + locked jazz mix §2.4; canvas 1344×768; ExtraBold packed title 80; plaque QA pass max_w 1134 | Why the cycle returns: inheritance and schools lecture film | `approved` | `ec84e4834b9608341d8a7b321205454be68560b1b219f088fb4f4bc7fc43f6ca` |
| `public/media/lesson-40-poster.webp` | Frame extract from approved lesson-40.mp4 | Lesson 40 poster | `approved` | `0558758e20fff7889e6feee8774bbeefb0e79afa042f266bfc5685e20928eba5` |
| `public/share/course.png` | xAI papercraft still + local title plate; 1200×630 Open Graph / Twitter card | Course social preview | `approved` | `d3055e010ea3957154057cfe6504136e8dcf74874cdebfe71f5f770274e01dd5` |
| `public/share/course-square.png` | xAI papercraft marshmallows + local title plate; 1080×1080 | Square share card | `approved` | `6ebf4e94cd4a1a0b673582cd073066748e33145e7eae7df5b916f17b3331d8ef` |
| `public/share/course-story.png` | xAI papercraft still + local title plate; 1080×1920 | Vertical / story share card | `approved` | `2ae108ad88190f0ea0381d25467d4df4bee6cab40ef1163e1e38865bcae606e0` |
| `public/media/buffett-florida-1998/lesson-01.mp4` | Buffett 1/45 v2 C5 cover; SHA-matched review cut | Throw hardballs lecture film | `approved-pipeline` | `0a763c105f253e3d55fae4686efb7aa4f6c492733030c2a230161e1f7adc96e5` |
| `public/media/buffett-florida-1998/lesson-01-poster.webp` | C5 cover still | 1/45 poster | `approved-pipeline` | `5db4f8df336f077c403031e27a8f0abb86175f7309c0f016621d4e7c6389fccd` |
| `public/media/buffett-florida-1998/lesson-02.mp4` | Buffett 2/45 conveyor cut | Integrity, intelligence and energy | `approved-pipeline` | `6b8be09d96105a2631dca8a6ec9fb6e7480ba2f2ac1a8389a21fcf3ec75658c2` |
| `public/media/buffett-florida-1998/lesson-02-poster.webp` | C5-model cover | 2/45 poster | `approved-pipeline` | `c9c526fb42930724d33272195edff234bd8188d2e088a246b2846680528cf801` |
| `public/media/buffett-florida-1998/lesson-03.mp4` | Buffett 3/45 conveyor cut | Buy ten percent of a classmate | `approved-pipeline` | `fafb518e4dcbb0718adfd622d47e927bc89be7fdc31ee258615251bc7f0a28b9` |
| `public/media/buffett-florida-1998/lesson-03-poster.webp` | C5-model cover | 3/45 poster | `approved-pipeline` | `99f9b1b877d3940dd5463000b2c0a408e89247141b67533777372291123bdcff` |
| `public/media/buffett-florida-1998/lesson-04.mp4` | Buffett 4/45 conveyor cut | Short ten percent — a kicker | `approved-pipeline` | `fcb262a201ee7e71edd2b9b0275cf9edae31fd8f7f8fb462b98a2e029ed6c53c` |
| `public/media/buffett-florida-1998/lesson-04-poster.webp` | C5-model cover | 4/45 poster | `approved-pipeline` | `e36ff21032d5d4df87f2a5f0b5911114d25bf40ed3ea4da931c07bb55186cfca` |
| `public/media/buffett-florida-1998/lesson-05.mp4` | Buffett 5/45 conveyor cut | Qualities you can choose | `approved-pipeline` | `3c1213e30d1ae4909ba5f8637fc55c2b6640f4e4140b5223c9751f168968970f` |
| `public/media/buffett-florida-1998/lesson-05-poster.webp` | C5-model cover | 5/45 poster | `approved-pipeline` | `a065cd5b0b3abd0ced54f169ad367c2794ba671ae5e2a84776fe6899baf79d0c` |
| `public/media/buffett-florida-1998/lesson-06.mp4` | Buffett 6/45 conveyor cut | You already own a hundred percent | `approved-pipeline` | `0f7cf074edb0a980e4e8fc2038ffff9955a9798c951d30b9b4083a79c34d444a` |
| `public/media/buffett-florida-1998/lesson-06-poster.webp` | C5-model cover | 6/45 poster | `approved-pipeline` | `9cf566d94ec332eca05ae6d17be8fbad8db1fbf5be6da7f19853d8308fc55114` |
| `public/media/buffett-florida-1998/lesson-07.mp4` | Buffett 7/45 conveyor cut | Not a macro guy — Japan | `approved-pipeline` | `7ffddffdf452d8628d223111ecb67f5562508f3c1b3286823a9be01df2a8dedb` |
| `public/media/buffett-florida-1998/lesson-07-poster.webp` | C5-model cover | 7/45 poster | `approved-pipeline` | `166c8cd50121bc4fe57ca1954411c1a918f6f8c7ab705dd4d744ee844f3349b4` |
| `public/media/buffett-florida-1998/lesson-08.mp4` | Buffett 8/45 conveyor cut | The cigar-butt approach | `approved-pipeline` | `cf9e60d672f85e5ac2dc7ae38e54d4ae046073df364fe9df33ede04bf1f8581d` |
| `public/media/buffett-florida-1998/lesson-08-poster.webp` | C5-model cover | 8/45 poster | `approved-pipeline` | `8b208ecc8ce976f4302407362b7bf0328075ade8b332530296236246d92bfb99` |
| `public/media/buffett-florida-1998/lesson-09.mp4` | Buffett 9/45 conveyor cut | Time is the friend of the wonderful business | `approved-pipeline` | `a3c782c97e211417aabcd2dc4af585f773349a00f87f5af3e825d1cd75744217` |
| `public/media/buffett-florida-1998/lesson-09-poster.webp` | C5-model cover | 9/45 poster | `approved-pipeline` | `4c9afe40228ae1422ca98dd71f4b6d36e86b8ea7320010751690081eb532f8b6` |
| `public/media/buffett-florida-1998/lesson-10.mp4` | Buffett 10/45 conveyor cut | The Alaska phone call | `approved-pipeline` | `9eaa308630581f1b25bdaefe9b200aa16f0d49b7db0527d4d087425b708a9cb4` |
| `public/media/buffett-florida-1998/lesson-10-poster.webp` | C5-model cover | 10/45 poster | `approved-pipeline` | `269e043644f894671d05ad61226fc3e4dada434afc64bc9fa4e7ae688d719d05` |
| `public/media/buffett-florida-1998/lesson-11.mp4` | Buffett 11/45 conveyor cut | Sixteen high IQs | `approved-pipeline` | `ae0253028e76f865a6e781a7f3ee055ccb6737c8ca454546451b8a7e6fce941a` |
| `public/media/buffett-florida-1998/lesson-11-poster.webp` | C5-model cover | 11/45 poster | `approved-pipeline` | `da482b2a79471f212c1d79fbdc2fb56228e275513ad2713efdb3cb1702294b7d` |
| `public/media/buffett-florida-1998/lesson-12.mp4` | Buffett 12/45 conveyor cut | Leverage and ruin | `approved-pipeline` | `6c64603c9f600d2cb187951c46b8aa7a20fe699dc5ee61b0f18821e38a5f5902` |
| `public/media/buffett-florida-1998/lesson-12-poster.webp` | C5-model cover | 12/45 poster | `approved-pipeline` | `323182046bc1bb2c92d23aca2f64a00f129c25adab422e53186bdcf0cd58445a` |
| `public/media/buffett-florida-1998/lesson-13.mp4` | Buffett 13/45 conveyor cut | A thousand chambers | `approved-pipeline` | `1ad8c2617160b9ef8a6ab29ab7b83f9e06fbb4d484bd3c5f375df63d356a43f6` |
| `public/media/buffett-florida-1998/lesson-13-poster.webp` | C5-model cover | 13/45 poster | `approved-pipeline` | `70d23f36613d2a501b47b68b31181eba6da2b0d2923eb6d77c13649ec5934516` |
| `public/media/buffett-florida-1998/lesson-14.mp4` | Buffett 14/45 conveyor cut | You only have to get rich once | `approved-pipeline` | `cf029b89766fad5ed785c43574e65295e48af0e48997c4f85258051efe191054` |
| `public/media/buffett-florida-1998/lesson-14-poster.webp` | C5-model cover | 14/45 poster | `approved-pipeline` | `310eb10c2e38f8c4d4a77eae9f9d1d24f35fc548b1285a0b888cf52fe7e80bd6` |
| `public/media/buffett-florida-1998/lesson-15.mp4` | Buffett 15/45 conveyor cut | Six-sigma won't save you | `approved-pipeline` | `56c126c082d1176c62de2cc710a57aab069c21fa558cac2a91e4b3374628390d` |
| `public/media/buffett-florida-1998/lesson-15-poster.webp` | C5-model cover | 15/45 poster | `approved-pipeline` | `f1c5955828801a989b6175c9a854093b505503719525eb14a5a8eddbca276133` |
| `public/media/buffett-florida-1998/lesson-16.mp4` | Buffett 16/45 conveyor cut | I never borrowed money | `approved-pipeline` | `02b97e6ccbf8f054fc6d2aeaf7289a8c80ecfb0c383a787b1c21e11aa9f1d802` |
| `public/media/buffett-florida-1998/lesson-16-poster.webp` | C5-model cover | 16/45 poster | `approved-pipeline` | `6c464a573518211c7facca797fc5d140f31738a64414266282ab92c52f983f9d` |
| `public/media/buffett-florida-1998/lesson-17.mp4` | Buffett 17/45 conveyor cut | Work in a job you love | `approved-pipeline` | `68cbc72431d079ba6deecb399faeacbf7912d83b534ce559cee1d8eb4396e35c` |
| `public/media/buffett-florida-1998/lesson-17-poster.webp` | C5-model cover | 17/45 poster | `approved-pipeline` | `f03591067f659fc322dbd300a9ad5475da3362a93f82c6f3d2a1c7df2adf70b6` |
| `public/media/buffett-florida-1998/lesson-18.mp4` | Buffett 18/45 conveyor cut | He said I was overpriced | `approved-pipeline` | `0905c809c79d9e780b9d23e4ce549d598a2408b941e377641a981edad9dd96eb` |
| `public/media/buffett-florida-1998/lesson-18-poster.webp` | C5-model cover | 18/45 poster | `approved-pipeline` | `fb2d8b5d31d32939451b590c80c27b5d24e39d88e34795dcc30773910cd3b0df` |
| `public/media/buffett-florida-1998/lesson-19.mp4` | Buffett 19/45 conveyor cut | Businesses I can understand | `approved-pipeline` | `09345f4e470a028504c53ef3efc8483d736f0f1dfaae9e695bbd757583dddca4` |
| `public/media/buffett-florida-1998/lesson-19-poster.webp` | C5-model cover | 19/45 poster | `approved-pipeline` | `302645a8eb4879b2e47a2a3f51f820b273a4c2943ed140c040d7f2277385ad84` |

## Not yet present

These land in later sprints and get their rows when the bytes exist — not before:

- `public/media/lesson-NN.mp4`, `lesson-NN-poster.webp`, `lesson-NN-narration.mp3` (sprints 6–7).
- `public/share/unit-N.png` (per-unit share cards).

`public/content/lesson-NN.json` and `src/content/course.ts` are **generated content, not media**: they are
built from `content/course.v2.json` by `scripts/build-content.mjs` on every build, so they are validated by
that script rather than hashed here.
