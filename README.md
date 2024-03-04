# Manage Archive

## How to run

- `yarn` to install dependencies
- Generate a dropbox app and access token at [https://www.dropbox.com/developers/apps/info/](https://www.dropbox.com/developers/apps/info/)
- Create a `.env` file in the root of the project with the following content:
  ```
  DROPBOX_ACCESS_TOKEN=your_access_token
  ```
- Drop the photos you want to check in the `src/check-dropbox/candidate-photos` folder
- `yarn check-dropbox` to run the script
