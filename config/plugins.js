
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
module.exports = ({ env }) => ({
  // ..
	'publisher': {
		enabled: true,
		config: {
			hooks: {
				beforePublish: async ({ strapi, uid, entity }) => {
					console.log('beforePublish');
				},
				afterPublish: async ({ strapi, uid, entity }) => {
					console.log('afterPublish');
				},
				beforeUnpublish: async ({ strapi, uid, entity }) => {
					console.log('beforeUnpublish');
				},
				afterUnpublish: async ({ strapi, uid, entity }) => {
					console.log('afterUnpublish');
				},
			},
		},
	},
  'random-sort': {
    enabled: true,
  },
	// ..
});
