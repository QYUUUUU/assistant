<?php

namespace App\Controller;

use Doctrine\Persistence\ManagerRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[Route('/')]
class ChatController extends AbstractController
{
    #[Route('/', name: 'chat', methods: ['GET'])]
    public function index(Request $request): Response
    {
        $session = $request->getSession();

        $messages = [
            [
                "role" => "system",
                "content" => "Aide moi à coder"
            ],
            [
                "role" => "assistant",
                "content" => "de quoi avez vous besoin ?",
            ],
        ];
        $session->set('messages', $messages);
        $session->set('usage', "");

        return $this->render('chat/index.html.twig');
    }


    /**
     * @param Request $request
     * @return void
     */
    #[Route('/chat/discussion', name: "discussion")]
    public function checkFiness(Request $request, ManagerRegistry $doctrine, HttpClientInterface $client)
    {
        //Récupérer La clé d'API dans .env
        $apiKey = $this->getParameter("apiKey");

        //Récupérer les messages enregistrés en session
        $session = $request->getSession();
        $messages = $session->get('messages');
        $usage = $session->get('usage');

        if ($usage && $usage["total_tokens"] >= 1000 && count($messages) > 3) {
            unset($messages[1]);
            unset($messages[2]);
            $messages = array_values($messages);
        }


        try {
            //Ajouter le message de l'utilisateur à la liste et appeler l'API
            $message = $request->getContent();
            array_push($messages, ["role" => "user", "content" => $message]);
            $response = $this->fetchDataFromOpenAPI($messages, $apiKey, $client);

            $data = json_decode($response->getContent(), true);
            $usage = $data["usage"];

            $text = $data['choices'][0]['message']['content'];

            array_push($messages, ["role" => "assistant", "content" => $text]);
            $session->set('messages', $messages);
            $session->set('usage', $usage);

            return $this->json([
                'success' => true,
                'data' => $text,
                'usage' => $usage,
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    //Fonctions 
    private function fetchDataFromOpenAPI($messages, $apiKey, $httpClient)
    {
        ini_set('max_execution_time', '300'); //300 seconds = 5 minutes

        set_time_limit(300);
        $url = 'https://api.openai.com/v1/chat/completions';
        $data = [
            'model' => 'gpt-4',
            'messages' => $messages,
            'temperature' => 0.6,
        ];
        $headers = [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $apiKey,
        ];

        $response = $httpClient->request('POST', $url, [
            'body' => json_encode($data),
            'headers' => $headers,
        ]);
        if ($response->getStatusCode() !== 200) {
            $errorMessage = $response->getContent();
            throw new \Exception('Failed to fetch data from the API: ' . $errorMessage);
        }


        return $response;
    }
}
