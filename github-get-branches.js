import { GraphQLClient, gql } from 'graphql-request';

const endpoint = 'https://api.github.com/graphql';
const owner = "";
const repo = "";
const pageSize = 100; 
const bearerToken = ""

const client = new GraphQLClient(endpoint,{
    headers:{
        authorization: `Bearer ${bearerToken}`
    }
})

// Define your GraphQL query with pagination variables
const query = gql`
  query Repository($after: String, $owner: String!, $repo: String!, $pageSize: Int) {
    repository(name: $repo, owner: $owner) {
        name
        refs(first: $pageSize, after: $after, refPrefix: "refs/heads/") {
            edges {
                node {
                    name
                    target {
                        ... on Commit {
                            author {
                                date
                            }
                        }
                    }
                }
            }
            pageInfo {
                endCursor
                hasNextPage            
            }
        }
       
    }
}
`;

// Function to fetch data with pagination
const fetchData = async () => {
  let hasNextPage = true;
  let after = null;

  let allBranches = [];

  while (hasNextPage) {
    const variables = {
      owner: owner,
      repo: repo,
      first: pageSize,
      after: after
    };

    try {
      const response = await client.request(query, variables);
      const refs = response.repository.refs;
      console.log(JSON.stringify(refs, null, 2));

      // Process the items
      refs.edges.forEach( edge => {
        allBranches.push({
            "branchName": edge.node.name,
            "createdDate": edge.node.target.author.date.split("T")[0]
        })
      });

      // Update pagination variables
      const pageInfo = refs.pageInfo;
      hasNextPage = pageInfo.hasNextPage;
      after = pageInfo.endCursor;
    } catch (error) {
      console.error('Error fetching data:', error);
      hasNextPage = false; 
    }
  }
  console.table(allBranches);
};

// Start fetching data
fetchData();
