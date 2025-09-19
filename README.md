This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Voting Results System

This application includes a comprehensive voting results system that allows administrators to close voting periods and generate detailed results tables.

### Features

- **Close Voting**: Admins can close voting for a specific period (e.g., "August 2024")
- **Automatic Results Generation**: When voting is closed, the system automatically generates a ranked results table
- **Results Display**: Beautiful table showing:
  - Rank (with special styling for top 3 positions)
  - Author information (name and email)
  - Post title and description
  - Link (if provided)
  - Total vote count
- **Historical Results**: View results from previous voting periods
- **Responsive Design**: Works on desktop and mobile devices

### How to Use

1. **As Admin**: Navigate to the admin page (`/admin`)
2. **Close Voting**: 
   - Enter a voting period name (e.g., "August 2024")
   - Click "🔒 Close Voting" button
   - The system will generate and save results automatically
3. **View Results**: 
   - Results will be displayed immediately after closing
   - Use "View Previous Results" section to see historical data
4. **Results Table**: Shows posts ranked by vote count in descending order

### Technical Details

- **Database**: Results are stored in MongoDB using the `VotingResult` model
- **API Endpoints**: 
  - `POST /api/voting-results` - Close voting and generate results
  - `GET /api/voting-results?period=<period>` - Get results for specific period
  - `GET /api/voting-periods` - Get all available voting periods
- **Components**: `VotingResults` component handles the results display
- **Security**: All admin functions require admin authentication
