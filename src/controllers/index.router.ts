import {Router, Request, Response} from 'express';
import { ImageRouter } from './images/routes/image.router';

const router: Router = Router(); //an instance of router

router.use('/', ImageRouter);

router.get('/', async (req: Request, res: Response) => {    // adding api/v0 to the root URL will send 'V0' string to the webpage
    res.send(`api`);
});

export const IndexRouter: Router = router;
